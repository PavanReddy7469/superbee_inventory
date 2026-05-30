const express = require('express');
const router = express.Router();
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', categoriesController.getAllCategories);
router.post('/', authorizeRoles('admin', 'superadmin'), categoriesController.createCategory);

module.exports = router;
