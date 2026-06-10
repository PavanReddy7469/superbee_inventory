const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const aeRequestsController = require('../controllers/aeRequestsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all AE requests
router.get('/', aeRequestsController.getAllRequests);

// Create new AE request with validation
// FIX-07: Validate inputs to prevent HTML injection, email domain spoofing, and structure issues
router.post(
  '/',
  [
    body('drone_number')
      .isString().withMessage('Drone number must be a string')
      .isLength({ min: 3, max: 50 }).withMessage('Drone number must be 3 to 50 characters'),
    body('uin_number')
      .isString().withMessage('UIN number must be a string')
      .isLength({ min: 3, max: 50 }).withMessage('UIN number must be 3 to 50 characters'),
    body('requested_by')
      .isString().withMessage('Requester name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Requester name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Requester name must not contain HTML tags');
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
    validate
  ],
  aeRequestsController.validateAERequestItems,
  aeRequestsController.createRequest
);

// Accept AE request
// FIX-05: Restrict accepting AE requests strictly to admin and superadmin roles
router.post('/:id/accept', authorizeRoles('admin', 'superadmin'), aeRequestsController.acceptRequest);

// Reject AE request
// FIX-05: Restrict rejecting AE requests strictly to admin and superadmin roles
router.post('/:id/reject', authorizeRoles('admin', 'superadmin'), aeRequestsController.rejectRequest);

// Withdraw AE request
// FIX-05: Technicians can withdraw, authorization is checked inside controller based on ownership
router.post('/:id/withdraw', aeRequestsController.withdrawRequest);

module.exports = router;

