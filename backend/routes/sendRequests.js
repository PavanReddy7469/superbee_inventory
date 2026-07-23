const express = require('express');
const router = express.Router();
const sendRequestsController = require('../controllers/sendRequestsController');
const { authenticateToken, requireAdmin } = require('../middleware/auth');

// Public route for creating (technicians & admins)
router.post('/', authenticateToken, sendRequestsController.createRequest);

// Admin-only routes
router.get('/', authenticateToken, sendRequestsController.getAllRequests);
router.patch('/:id/status', authenticateToken, requireAdmin, sendRequestsController.updateStatus);

module.exports = router;
