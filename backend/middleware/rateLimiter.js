const rateLimit = require('express-rate-limit');

// FIX-06: Rate limit login attempts to prevent brute-force attacks (max 5 requests per 15 minutes)
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many login attempts. Try again in 15 min.' }
});

// FIX-06: General API rate limiting to prevent Denial of Service (DoS) and abuse (max 100 requests per minute)
const generalLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100,
  message: { error: 'Too many requests.' }
});

module.exports = { loginLimiter, generalLimiter };
