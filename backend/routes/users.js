const express = require('express');
const router = express.Router();
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users
// FIX-04: Enforce role-based access control (Admin and Superadmin only can view users list)
router.get('/', authorizeRoles('admin', 'superadmin'), usersController.getAllUsers);

// Create new user
// FIX-04: Only Superadmin is authorized to create new users to prevent unauthorized privilege escalation
router.post('/', authorizeRoles('superadmin'), usersController.createUser);

// Update user status
// FIX-04: Only Admin and Superadmin can update status to prevent technicians from enabling inactive accounts
router.patch('/:id/status', authorizeRoles('admin', 'superadmin'), usersController.updateUserStatus);

// Delete user
// FIX-04: Only Superadmin can delete accounts to prevent malicious data destruction by normal admins
router.delete('/:id', authorizeRoles('superadmin'), usersController.deleteUser);

module.exports = router;
