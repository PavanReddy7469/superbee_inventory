const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/database');
const auditLog = require('../middleware/auditLog');
const passwordPolicy = require('../utils/passwordPolicy');

// Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const ipAddress = req.ip || req.connection.remoteAddress;
    const userAgent = req.headers['user-agent'] || '';

    // Validate input
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }

    // FIX-06: Lock account for 15 mins after 5 failed attempts from same email + IP address
    const [locks] = await db.query(`
      SELECT COUNT(*) as failed_count 
      FROM login_attempts 
      WHERE email = ? AND ip_address = ? AND success = FALSE 
        AND attempt_time > DATE_SUB(NOW(), INTERVAL 15 MINUTE)
    `, [email, ipAddress]);

    if (locks[0].failed_count >= 5) {
      // Log attempt as failed (locked)
      await db.query(`
        INSERT INTO login_attempts (email, ip_address, user_agent, success)
        VALUES (?, ?, ?, FALSE)
      `, [email, ipAddress, userAgent]);
      
      // FIX-09: Log locked login failure to audit_logs table
      await auditLog(db, req, 'LOGIN_FAILED', 'users', null, `Failed login attempt: Account locked for email: ${email}`);
      
      return res.status(429).json({ error: 'Account locked due to too many failed login attempts. Try again in 15 minutes.' });
    }

    // Get user with role
    const [users] = await db.query(`
      SELECT u.*, r.name as role_name, r.level as role_level
      FROM users u
      LEFT JOIN roles r ON u.role_id = r.id
      WHERE u.email = ? AND u.is_active = TRUE
    `, [email]);

    const user = users.length > 0 ? users[0] : null;

    // FIX-06: Timing attack fix: always perform bcrypt.compare() even when the user is not found using a pre-computed dummy hash
    let validPassword = false;
    if (user) {
      validPassword = await bcrypt.compare(password, user.password_hash);
    } else {
      await bcrypt.compare(password, '$2b$12$L.bO/G.s4WJv4a.k65k0be9Dux2wWc4wN.b9wV8tA2SKeY5k07.G6');
    }

    if (!user || !validPassword) {
      // Log failed attempt
      await db.query(`
        INSERT INTO login_attempts (email, ip_address, user_agent, success)
        VALUES (?, ?, ?, FALSE)
      `, [email, ipAddress, userAgent]);

      // FIX-09: Log login failure to audit_logs table
      await auditLog(db, req, 'LOGIN_FAILED', 'users', null, `Failed login attempt for email: ${email}`);

      // FIX-06: Uniform error message to prevent user enumeration (disclosing if email exists or not)
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Log successful attempt
    await db.query(`
      INSERT INTO login_attempts (email, ip_address, user_agent, success)
      VALUES (?, ?, ?, TRUE)
    `, [email, ipAddress, userAgent]);

    // Set req.user to ensure user ID is recorded in audit log
    req.user = { id: user.id };
    // FIX-09: Log successful login to database audit trail
    await auditLog(db, req, 'LOGIN_SUCCESS', 'users', user.id, `User ${email} logged in successfully`);

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

    // FIX-03: Set cookie instead of sending token in JSON response body (XSS Mitigation)
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Strict',
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
      path: '/'
    });

    res.json({
      message: 'Login successful',
      // FIX-02: Expose password change redirection status so frontend can force a change if must_change_password is true
      requiresPasswordChange: user.must_change_password === 1,
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
             u.designation, u.is_active, u.created_at, u.must_change_password,
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
      must_change_password: user.must_change_password === 1,
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

// FIX-03: Expose getCurrentUser to serve /me endpoint from cookie session
exports.getCurrentUser = async (req, res) => {
  try {
    const [users] = await db.query(`
      SELECT u.id, u.email, u.name, u.mobile_number, u.employee_id, 
             u.designation, u.is_active, u.created_at, u.must_change_password,
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
      is_active: user.is_active === 1,
      created_at: user.created_at,
      must_change_password: user.must_change_password === 1,
      role: {
        name: user.role_name,
        level: user.role_level
      }
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: 'Failed to get current user session' });
  }
};

// Logout
exports.logout = (req, res) => {
  // FIX-03: Clear authToken cookie upon logout (XSS Mitigation / Session Termination)
  res.clearCookie('authToken');
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

    // FIX-11: Ensure new password is different from the old password
    if (newPassword === oldPassword) {
      return res.status(400).json({ error: 'New password must be different from the old password' });
    }

    // FIX-11: Validate password complexity schema before hashing
    const failedRules = passwordPolicy.validate(newPassword, { list: true });
    if (failedRules.length > 0) {
      return res.status(400).json({ 
        error: `New password does not meet complexity rules. Failed rules: ${failedRules.join(', ')}` 
      });
    }

    // Hash new password
    // FIX-02: Increase bcrypt rounds from 10 to 12
    const salt = await bcrypt.genSalt(12);
    const passwordHash = await bcrypt.hash(newPassword, salt);

    // Update password
    // FIX-02: Reset must_change_password flag to FALSE (0) upon manual password change completion
    await db.query('UPDATE users SET password_hash = ?, must_change_password = 0 WHERE id = ?', [passwordHash, req.user.id]);

    // FIX-09: Log password change to database audit trail
    await auditLog(db, req, 'PASSWORD_CHANGED', 'users', req.user.id, `User password changed successfully`);

    res.json({ message: 'Password updated successfully' });
  } catch (error) {
    console.error('Change password error:', error);
    res.status(500).json({ error: 'Failed to update password' });
  }
};
