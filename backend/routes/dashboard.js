const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get dashboard statistics
router.get('/stats', dashboardController.getStats);

// Get products by category
router.get('/products', dashboardController.getProductsByCategory);

module.exports = router;
