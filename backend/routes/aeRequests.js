const express = require('express');
const router = express.Router();
const aeRequestsController = require('../controllers/aeRequestsController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all AE requests
router.get('/', aeRequestsController.getAllRequests);

// Create new AE request
router.post('/', aeRequestsController.createRequest);

// Accept AE request
router.post('/:id/accept', aeRequestsController.acceptRequest);

// Reject AE request
router.post('/:id/reject', aeRequestsController.rejectRequest);

// Withdraw AE request
router.post('/:id/withdraw', aeRequestsController.withdrawRequest);

module.exports = router;
