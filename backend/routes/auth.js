const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
// FIX-06: Apply login rate limiter to protect /login from brute-force authentication attempts
// FIX-07: Validate login inputs (email and password existence)
router.post(
  '/login', 
  loginLimiter, 
  [
    body('email')
      .isEmail().withMessage('Must be a valid email')
      .custom(value => {
        if (value && !value.endsWith('@superbee.com')) {
          throw new Error('Email must end with @superbee.com');
        }
        return true;
      }),
    body('password').notEmpty().withMessage('Password is required'),
    validate
  ],
  authController.login
);

router.post('/logout', authController.logout);

// GET CSRF Token endpoint
// FIX-15: Provide CSRF token to frontend client securely
router.get('/csrf-token', (req, res) => {
  res.json({ csrfToken: req.csrfToken() });
});

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
// FIX-03: Expose /me endpoint to check auth status and return session payload to client programmatically from cookie
router.get('/me', authenticateToken, authController.getCurrentUser);

// Change password with validation
// FIX-07: Validate password payload formatting and strength rules
// FIX-11: Enforce password policy guidelines
router.post(
  '/change-password', 
  authenticateToken, 
  [
    body('oldPassword').notEmpty().withMessage('Old password is required'),
    body('newPassword')
      .isLength({ min: 8 }).withMessage('New password must be at least 8 characters')
      .custom(value => {
        if (value) {
          if (!/[A-Z]/.test(value)) throw new Error('New password must contain at least one uppercase letter');
          if (!/[a-z]/.test(value)) throw new Error('New password must contain at least one lowercase letter');
          if (!/[0-9]/.test(value)) throw new Error('New password must contain at least one digit');
          if (!/[^A-Za-z0-9]/.test(value)) throw new Error('New password must contain at least one special character');
        }
        return true;
      }),
    validate
  ],
  authController.changePassword
);

module.exports = router;

