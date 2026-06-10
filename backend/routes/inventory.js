const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const validate = require('../middleware/validate');
const inventoryController = require('../controllers/inventoryController');
const { authenticateToken, authorizeRoles } = require('../middleware/auth');

// All routes require authentication
router.use(authenticateToken);

// Get all parts (all roles)
router.get('/', inventoryController.getAllParts);

// Get single part (all roles)
router.get('/:id', inventoryController.getPartById);

// Create part (admin only)
// FIX-07: Apply input validation rules on SKU, name, quantity, price, and status to block malformed inputs
router.post(
  '/', 
  authorizeRoles('admin', 'superadmin'), 
  [
    body('sku')
      .isString().withMessage('SKU must be a string')
      .isLength({ min: 1, max: 100 }).withMessage('SKU must be 1 to 100 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('SKU must not contain HTML tags');
        }
        return true;
      }),
    body('name')
      .isString().withMessage('Name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Name must not contain HTML tags');
        }
        return true;
      }),
    body('category_id')
      .isString().withMessage('Category ID must be a string'),
    body('manufacturer')
      .optional()
      .isString().withMessage('Manufacturer must be a string')
      .isLength({ max: 255 }).withMessage('Manufacturer must be at most 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Manufacturer must not contain HTML tags');
        }
        return true;
      }),
    body('serial_number')
      .optional()
      .isString().withMessage('Serial number must be a string')
      .isLength({ max: 255 }).withMessage('Serial number must be at most 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Serial number must not contain HTML tags');
        }
        return true;
      }),
    body('quantity')
      .optional()
      .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('price')
      .optional()
      .isFloat({ min: 0.01 }).withMessage('Price must be a positive decimal')
      .custom(value => {
        if (value !== undefined && value !== null) {
          if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
            throw new Error('Price can have at most 2 decimal places');
          }
        }
        return true;
      }),
    body('status')
      .optional()
      .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate
  ],
  inventoryController.createPart
);

// Update part (admin only)
// FIX-07: Validate updated fields (name, quantity, price, status)
router.put(
  '/:id', 
  authorizeRoles('admin', 'superadmin'), 
  [
    body('name')
      .isString().withMessage('Name must be a string')
      .isLength({ min: 1, max: 255 }).withMessage('Name must be 1 to 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Name must not contain HTML tags');
        }
        return true;
      }),
    body('category_id')
      .isString().withMessage('Category ID must be a string'),
    body('manufacturer')
      .optional()
      .isString().withMessage('Manufacturer must be a string')
      .isLength({ max: 255 }).withMessage('Manufacturer must be at most 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Manufacturer must not contain HTML tags');
        }
        return true;
      }),
    body('serial_number')
      .optional()
      .isString().withMessage('Serial number must be a string')
      .isLength({ max: 255 }).withMessage('Serial number must be at most 255 characters')
      .custom(value => {
        if (value && /<[^>]*>/i.test(value)) {
          throw new Error('Serial number must not contain HTML tags');
        }
        return true;
      }),
    body('quantity')
      .isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer'),
    body('price')
      .isFloat({ min: 0.01 }).withMessage('Price must be a positive decimal')
      .custom(value => {
        if (value !== undefined && value !== null) {
          if (!/^\d+(\.\d{1,2})?$/.test(String(value))) {
            throw new Error('Price can have at most 2 decimal places');
          }
        }
        return true;
      }),
    body('status')
      .isIn(['active', 'inactive']).withMessage('Status must be active or inactive'),
    validate
  ],
  inventoryController.updatePart
);

// Delete part (admin only)
router.delete('/:id', authorizeRoles('admin', 'superadmin'), inventoryController.deletePart);

module.exports = router;

