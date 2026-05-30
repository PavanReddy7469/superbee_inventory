const pool = require('../config/database');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

// Get all users (filtered by role)
exports.getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    
    let query = `
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
    `;
    
    const params = [];
    if (role) {
      query += ' WHERE r.name = ?';
      params.push(role);
    }
    
    query += ' ORDER BY u.created_at DESC';
    
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
    
    res.json(formattedUsers);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};

// Create new user
exports.createUser = async (req, res) => {
  try {
    const { name, email, password, mobile_number, employee_id, designation, role_name } = req.body;
    
    // Validate email domain
    if (!email.endsWith('@superbee.com')) {
      return res.status(400).json({ error: 'Email must be from @superbee.com domain' });
    }
    
    // Check if user already exists
    const [existing] = await pool.query('SELECT id FROM users WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(400).json({ error: 'User with this email already exists' });
    }
    
    // Get role ID
    const [roleResult] = await pool.query('SELECT id FROM roles WHERE name = ?', [role_name || 'technician']);
    if (roleResult.length === 0) {
      return res.status(400).json({ error: 'Invalid role' });
    }
    
    const roleId = roleResult[0].id;
    
    // Hash password
    const hashedPassword = await bcrypt.hash(password || 'Superbee@123', 10);
    
    // Create user
    const userId = uuidv4();
    await pool.query(
      `INSERT INTO users (id, role_id, name, email, password_hash, mobile_number, employee_id, designation, is_active)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
      [userId, roleId, name, email, hashedPassword, mobile_number, employee_id, designation]
    );
    
    // Fetch created user
    const [newUser] = await pool.query(
      `SELECT u.*, r.name as role_name, r.level as role_level
       FROM users u
       LEFT JOIN roles r ON u.role_id = r.id
       WHERE u.id = ?`,
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
    
    await pool.query('DELETE FROM users WHERE id = ?', [id]);
    
    res.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ error: 'Failed to delete user' });
  }
};
