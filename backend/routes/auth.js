const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { authenticateToken } = require('../middleware/auth');
const { loginLimiter } = require('../middleware/rateLimiter');

// Public routes
// FIX-06: Apply login rate limiter to protect /login from brute-force authentication attempts
router.post('/login', loginLimiter, authController.login);
router.post('/logout', authController.logout);

// Protected routes
router.get('/profile', authenticateToken, authController.getProfile);
// FIX-03: Expose /me endpoint to check auth status and return session payload to client programmatically from cookie
router.get('/me', authenticateToken, authController.getCurrentUser);
router.post('/change-password', authenticateToken, authController.changePassword);

module.exports = router;
