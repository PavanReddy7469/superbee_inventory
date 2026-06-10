const { validationResult } = require('express-validator');

// Helper middleware to check for validation errors and return HTTP 400 with field-level errors
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    // Return HTTP 400 with field-level validation errors
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

module.exports = validate;
