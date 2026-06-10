const jwt = require('jsonwebtoken');

const authenticateToken = (req, res, next) => {
  // FIX-03: Read JWT token from secure httpOnly cookie instead of localStorage/Authorization header (XSS Mitigation)
  const token = req.cookies && req.cookies.authToken;

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  // FIX-01: Ensure signature validation relies strictly on process.env.JWT_SECRET with no hardcoded fallbacks
  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid or expired token' });
    }
    req.user = user;
    next();
  });
};

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    // FIX-04: Explicitly return HTTP 403 Forbidden (not 401 Unauthorized) when the authenticated user lacks permissions
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ 
        error: 'Access denied. Insufficient permissions.' 
      });
    }
    next();
  };
};

module.exports = { authenticateToken, authorizeRoles };
