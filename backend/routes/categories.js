const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const categoriesController = require('../controllers/categoriesController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

router.use(authenticateToken);

router.get('/', categoriesController.getAllCategories);

// Create category with validation
// FIX-07: Apply input validation rules on category name and status to block HTML injection
router.post(
  '/', 
  authorizeRoles('admin', 'superadmin'), 
  [
    body('name')
      .isString().withMessage('Category name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Category name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Category name must not contain HTML tags');
        }
        return true;
      }),
    body('description')
      .optional()
      .isString().withMessage('Description must be a string')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Description must not contain HTML tags');
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate
  ],
  categoriesController.createCategory
);

// Update category with validation
// FIX-07: Validate category name and status on update
router.put(
  '/:id', 
  authorizeRoles('admin', 'superadmin'), 
  [
    body('name')
      .isString().withMessage('Category name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Category name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Category name must not contain HTML tags');
        }
        return true;
      }),
    body('description')
      .optional()
      .isString().withMessage('Description must be a string')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Description must not contain HTML tags');
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate
  ],
  categoriesController.updateCategory
);

router.delete('/:id', authorizeRoles('admin', 'superadmin'), categoriesController.deleteCategory);

module.exports = router;

