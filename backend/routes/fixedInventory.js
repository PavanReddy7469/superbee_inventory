const express = require('express');
const router = express.Router();
const fixedInventoryController = require('../controllers/fixedInventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all fixed inventory items
router.get('/', fixedInventoryController.getAllFixedAssets);

// Get single fixed asset by ID
router.get('/:id', fixedInventoryController.getFixedAssetById);

// Create new fixed asset (Admin/Superadmin)
router.post('/', authorizeRoles('admin', 'superadmin'), fixedInventoryController.createFixedAsset);

// Update fixed asset (Admin/Superadmin)
router.put('/:id', authorizeRoles('admin', 'superadmin'), fixedInventoryController.updateFixedAsset);

// Transfer asset (Admin/Superadmin)
router.post('/:id/transfer', authorizeRoles('admin', 'superadmin'), fixedInventoryController.transferFixedAsset);

// Delete fixed asset (Admin/Superadmin)
router.delete('/:id', authorizeRoles('admin', 'superadmin'), fixedInventoryController.deleteFixedAsset);

module.exports = router;
