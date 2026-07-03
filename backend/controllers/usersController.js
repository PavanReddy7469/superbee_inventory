const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const auditLog = require('../middleware/auditLog');
const passwordPolicy = require('../utils/passwordPolicy');

// Get all users (filtered by role, paginated)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    // FIX-17: Accept query parameters: page (default 1), limit (default 50, max 100)
    let page = parseInt(req.query.page, 10) || 1;
    let limit = parseInt(req.query.limit, 10) || 50;
    if (limit > 100) limit = 100;
    if (page < 1) page = 1;
    const offset = (page - 1) * limit;

    // FIX-20: Add WHERE is_deleted = FALSE to SELECT queries
    let countQuery = `
      SELECT COUNT(*) as count
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.is_deleted = FALSE
    `;
    
    let query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.is_deleted = FALSE
    `;
    
    const params = [];
    const countParams = [];
    if (role) {
      countQuery += ' AND r.name = ?';
      query += ' AND r.name = ?';
      params.push(role);
      countParams.push(role);
    }
    
    query += ' ORDER BY u.created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, offset);
    
    const [countResult] = await pool.query(countQuery, countParams);
    const total = countResult[0].count;

    const [users] = await pool.query(query, params);
    
    // Format response to match frontend expectations
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      mobile_number: user.mobile_number,
      employee_id: user.employee_id,
      designation: user.designation,
      is_active: user.is_active === 1,
      role_id: user.role_id,
      created_at: user.created_at,
      role: {
        name: user.role_name,
        level: user.role_level
      }
    }));
    
    const totalPages = Math.ceil(total / limit);

    // FIX-17: Return paginated response envelope
    res.json({
      data: formattedUsers,
      total,
      page,
      limit,
      totalPages
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, mobile_number, employee_id, designation, role_name } = req.body;
    


    // FIX-02: Enforce password requirement on creation, blocking empty passwords/default fallback
    if (!password || password.trim().length === 0) {
      return res.status(400).json({ error: 'Password is required' });
    }

    // FIX-04: Prevent non-superadmins from escalating privilege by creating a superadmin user
    if (role_name === 'superadmin' && req.user.role !== 'superadmin') {
      return res.status(403).json({ error: 'Only superadmins can create superadmin accounts' });
    }
    
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ? AND is_deleted = FALSE', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Get role ID
    const [roleResult] = await pool.query('SELECT id FROM roles WHERE name = ?', [role_name || 'technician']);
    if (roleResult.length === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const roleId = roleResult[0].id;
    
    // FIX-11: Validate password using password-validator schema before hashing
    const failedRules = passwordPolicy.validate(password, { list: true });
    if (failedRules.length > 0) {
      return res.status(400).json({ 
        error: `Password does not meet complexity rules. Failed rules: ${failedRules.join(', ')}` 
      });
    }

    // Hash password
    // FIX-02: Increase bcrypt rounds from 10 to 12 for stronger password hashing resistance
    const hashedPassword = await bcrypt.hash(password, 12);
    
    // Create user
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, role_id, name, email, password_hash, mobile_number, employee_id, designation, is_active, must_change_password)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1, 1)`,
      [userId, roleId, name, email, hashedPassword, mobile_number, employee_id, designation]
    );
    
    // FIX-09: Log user creation to database audit trail
    await auditLog(pool, req, 'CREATE_USER', 'users', userId, `User ${email} created successfully`);
    
    // Fetch created user
    const [newUser] = await pool.query(
      `SELECT u.*, r.name as role_name, r.level as role_level
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ? AND u.is_deleted = FALSE`,
      [userId]
    );
    
    res.status(201).json({
      message: 'User created successfully',
      user: {
        id: newUser[0].id,
        name: newUser[0].name,
        email: newUser[0].email,
        mobile_number: newUser[0].mobile_number,
        employee_id: newUser[0].employee_id,
        designation: newUser[0].designation,
        is_active: newUser[0].is_active === 1,
        role: {
          name: newUser[0].role_name,
          level: newUser[0].role_level
        }
      }
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ error: 'Failed to create user' });
  }
};

// Update user status
exports.updateUserStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;
    
    await pool.query('UPDATE users SET is_active = ? WHERE id = ?', [is_active ? 1 : 0, id]);
    
    // FIX-09: Log user status change to database audit trail
    await auditLog(pool, req, 'UPDATE_USER_STATUS', 'users', id, `User status updated to ${is_active ? 'active' : 'inactive'}`);
    
    res.json({ message: 'User status updated successfully' });
  } catch (error) {
    console.error('Error updating user status:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
};

// Delete user
exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // FIX-04: Prevent user from deleting their own account (accidental lockout mitigation)
    if (id === req.user.id) {
      return res.status(403).json({ error: 'You cannot delete your own account' });
    }

    // FIX-04: Prevent deleting the last superadmin to ensure system recovery capabilities remain intact
    const [targetUser] = await pool.query(`
      SELECT u.email, r.name as role_name 
      FROM users u 
      LEFT JOIN roles r ON u.role_id = r.id 
      WHERE u.id = ? AND u.is_deleted = FALSE
    `, [id]);

    if (targetUser.length > 0 && targetUser[0].role_name === 'superadmin') {
      const [superadmins] = await pool.query(`
        SELECT COUNT(*) as count 
        FROM users u 
        LEFT JOIN roles r ON u.role_id = r.id 
        WHERE r.name = 'superadmin' AND u.is_deleted = FALSE
      `);

      if (superadmins[0].count <= 1) {
        return res.status(403).json({ error: 'Cannot delete the last superadmin account' });
      }
    }
    
    // FIX-20: Soft delete user instead of hard deleting
    await pool.query('UPDATE users SET is_deleted = TRUE, deleted_at = NOW() WHERE id = ?', [id]);
    
    // FIX-09: Log user deletion to database audit trail
    await auditLog(pool, req, 'DELETE_USER', 'users', id, `User with ID ${id} deleted`);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
