const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // Get user with role
    const [users] = await db.query(`
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.is_active = TRUE
    `, [email]);

    if (users.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = users[0];

    // Verify password
    const validPassword = await bcrypt.compare(password, user.password_hash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { 
        id: user.id, 
        email: user.email, 
        role: user.role_name 
      },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Remove password from response
    delete user.password_hash;

    res.json({
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        employee_id: user.employee_id,
        designation: user.designation,
        role: {
          name: user.role_name,
          level: user.role_level
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
};

// Get current user profile
exports.getProfile = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.email, u.name, u.mobile_number, u.employee_id, 
             u.designation, u.is_active, u.created_at,
             r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.id = ?
    `, [req.user.id]);

    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];
    res.json({
      id: user.id,
      email: user.email,
      name: user.name,
      mobile_number: user.mobile_number,
      employee_id: user.employee_id,
      designation: user.designation,
      is_active: user.is_active,
      created_at: user.created_at,
      role: {
        name: user.role_name,
        level: user.role_level
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to get profile' });
  }
};

// Logout (optional - mainly client-side)
exports.logout = (req, res) => {
  res.json({ message: 'Logout successful' });
};

// Change Password
exports.changePassword = async (req, res) => {
  try {
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({ error: 'Old password and new password required' });
    }

    // Get user from database
    const [users] = await db.query('SELECT password_hash FROM users WHERE id = ?', [req.user.id]);
    if (users.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = users[0];

    // Verify old password
    const validPassword = await bcrypt.compare(oldPassword, user.password_hash);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid current password' });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    await db.query('UPDATE users SET password_hash = ? WHERE id = ?', [passwordHash, req.user.id]);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
