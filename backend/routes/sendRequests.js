const express = require('express');
const router = express.Router();
const sendRequestsController = require('../controllers/sendRequestsController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// Public route for creating (technicians & admins)
router.post('/', authenticateToken, sendRequestsController.createRequest);

// Admin-only routes
router.get('/', authenticateToken, sendRequestsController.getAllRequests);
router.patch('/:id/status', authenticateToken, authorizeRoles('admin', 'superadmin'), sendRequestsController.updateStatus);

module.exports = router;
