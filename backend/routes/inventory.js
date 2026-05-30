const express = require('express');
const router = express.Router();
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all parts (all roles)
router.get('/', inventoryController.getAllParts);

// Get single part (all roles)
router.get('/:id', inventoryController.getPartById);

// Create part (admin only)
router.post('/', authorizeRoles('admin', 'superadmin'), inventoryController.createPart);

// Update part (admin only)
router.put('/:id', authorizeRoles('admin', 'superadmin'), inventoryController.updatePart);

// Delete part (admin only)
router.delete('/:id', authorizeRoles('admin', 'superadmin'), inventoryController.deletePart);

module.exports = router;
