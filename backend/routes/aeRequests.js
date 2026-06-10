const express = require('express');
const router = express.Router();
const aeRequestsController = require('../controllers/aeRequestsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all AE requests
router.get('/', aeRequestsController.getAllRequests);

// Create new AE request
router.post('/', aeRequestsController.createRequest);

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
