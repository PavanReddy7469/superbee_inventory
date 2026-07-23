const express = require('express');
const router = express.Router();
const externalTestersController = require('../controllers/externalTestersController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all dispatches
router.get('/', externalTestersController.getAllDispatches);

// Get all inventory parts for dropdown (no pagination)
router.get('/inventory-parts', externalTestersController.getAllInventoryParts);

// Create new external testing dispatch (Admin/Superadmin)
router.post('/', authorizeRoles('admin', 'superadmin'), externalTestersController.createDispatch);

// Mark dispatch returned to stock (Admin/Superadmin)
router.post('/:id/return', authorizeRoles('admin', 'superadmin'), externalTestersController.markReturned);

// Mark dispatch consumed/damaged (Admin/Superadmin)
router.post('/:id/consumed', authorizeRoles('admin', 'superadmin'), externalTestersController.markConsumed);

// Delete dispatch record (Admin/Superadmin)
router.delete('/:id', authorizeRoles('admin', 'superadmin'), externalTestersController.deleteDispatch);

module.exports = router;
