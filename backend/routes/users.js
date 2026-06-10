const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const usersController = require('../controllers/usersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all users
// FIX-04: Enforce role-based access control (Admin and Superadmin only can view users list)
router.get('/', authorizeRoles('admin', 'superadmin'), usersController.getAllUsers);

// Create new user with validation
// FIX-04: Only Superadmin is authorized to create new users to prevent unauthorized privilege escalation
// FIX-07: Apply validation rules to name, email, password, mobile_number, employee_id, and role_name
router.post(
  '/', 
  authorizeRoles('superadmin'), 
  [
    body('name')
      .isString().withMessage('Name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Name must not contain HTML tags');
        }
        return true;
      }),
    body('email')
      .isEmail().withMessage('Must be a valid email')
      .custom(value => {
        if (value && !value.endsWith('@superbee.com')) {
          throw new Error('Email must end with @superbee.com');
        }
        return true;
      }),
    body('password')
      .isLength({ min: 12 }).withMessage('Password must be at least 12 characters')
      .custom(value => {
        if (value) {
          if (!/[A-Z]/.test(value)) throw new Error('Password must contain at least one uppercase letter');
          if (!/[a-z]/.test(value)) throw new Error('Password must contain at least one lowercase letter');
          if (!/[0-9]/.test(value)) throw new Error('Password must contain at least one digit');
          if (!/[^A-Za-z0-9]/.test(value)) throw new Error('Password must contain at least one special character');
        }
        return true;
      }),
    body('mobile_number')
      .matches(/^\+?[0-9]{10,15}$/).withMessage('Mobile number must be 10 to 15 digits, optionally starting with +'),
    body('employee_id')
      .isAlphanumeric().withMessage('Employee ID must be alphanumeric')
      .isLength({ min: 3, max: 20 }).withMessage('Employee ID must be 3 to 20 characters'),
    body('designation')
      .optional()
      .isString().withMessage('Designation must be a string')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Designation must not contain HTML tags');
        }
        return true;
      }),
    body('role_name')
      .isIn(['superadmin', 'admin', 'technician']).withMessage('Role must be superadmin, admin, or technician'),
    validate
  ],
  usersController.createUser
);

// Update user status with validation
// FIX-04: Only Admin and Superadmin can update status to prevent technicians from enabling inactive accounts
// FIX-07: Validate that is_active is boolean
router.patch(
  '/:id/status', 
  authorizeRoles('admin', 'superadmin'), 
  [
    body('is_active').isBoolean().withMessage('is_active must be a boolean'),
    validate
  ],
  usersController.updateUserStatus
);

// Delete user
// FIX-04: Only Superadmin can delete accounts to prevent malicious data destruction by normal admins
router.delete('/:id', authorizeRoles('superadmin'), usersController.deleteUser);

module.exports = router;

