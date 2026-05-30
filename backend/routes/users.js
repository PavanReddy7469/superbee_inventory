const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users
router.get('/', usersController.getAllUsers);

// Create new user
router.post('/', usersController.createUser);

// Update user status
router.patch('/:id/status', usersController.updateUserStatus);

// Delete user
router.delete('/:id', usersController.deleteUser);

module.exports = router;
