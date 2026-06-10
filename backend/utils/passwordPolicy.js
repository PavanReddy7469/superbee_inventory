const PasswordValidator = require('password-validator');

// FIX-11: Setup strict password validation schema to prevent weak user passwords
const schema = new PasswordValidator()
  .min(12).max(128)       // Minimum 12, maximum 128 characters
  .uppercase()            // Must have uppercase letters
  .lowercase()            // Must have lowercase letters
  .digits(1)              // Must have at least 1 digit
  .symbols(1)             // Must have at least 1 symbol
  .not().spaces();        // Cannot contain spaces

module.exports = schema;
