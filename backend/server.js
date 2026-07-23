const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const csrf = require('csurf');
const { generalLimiter } = require('./middleware/rateLimiter');
require('dotenv').config();

// FIX-01: Startup guard to ensure JWT_SECRET is configured and sufficiently long (prevents weak keys/default key leakage)
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('FATAL: JWT_SECRET missing or too short');
}

const app = express();
const PORT = process.env.PORT || 5000;

// FIX-08: Apply Helmet security response headers to enforce strong CSP, deny clickjacking (X-Frame-Options: DENY), and disable frames/object reuse
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'", process.env.FRONTEND_URL || 'http://localhost:5173'],
      frameSrc:   ["'none'"],
      objectSrc:  ["'none'"],
    }
  },
  hsts: { maxAge: 31536000, includeSubDomains: true, preload: true },
  frameguard: { action: 'deny' }
}));

// FIX-08: Redirect all insecure HTTP traffic to HTTPS in production environments
if (process.env.NODE_ENV === 'production') {
  app.use((req, res, next) => {
    if (req.header('x-forwarded-proto') !== 'https') {
      return res.redirect(301, `https://${req.header('host')}${req.url}`);
    }
    next();
  });
}

// FIX-12: Enforce strict whitelist CORS mapping (No wildcards or loose regex matching for localhost)
const allowedOrigins = (process.env.CORS_ORIGIN || '')
  .split(',')
  .map(o => o.trim())
  .filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) {
      return callback(null, true);
    }
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`CORS: ${origin} not allowed`));
  },
  credentials: true
}));

// FIX-16: Enforce request size limits to prevent buffer overflow/exhaustion Denial of Service (DoS) attacks
app.use(express.json({ limit: '15mb' }));
app.use(express.urlencoded({ extended: true, limit: '15mb' }));
app.use(cookieParser());

// FIX-15: Apply cookie-based CSRF protection middleware directly after body/cookie parsing
app.use(csrf({
  cookie: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'Strict'
  }
}));

// FIX-06: Apply general rate limiter to protect all /api routes from DoS/abuse
app.use('/api', generalLimiter);

// Test database connection
require('./config/database');

// Basic route
app.get('/', (req, res) => {
  res.json({ 
    message: 'SuperBee Aeronautics API',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Import routes
const authRoutes = require('./routes/auth');
const inventoryRoutes = require('./routes/inventory');
const categoriesRoutes = require('./routes/categories');
const usersRoutes = require('./routes/users');
const aeRequestsRoutes = require('./routes/aeRequests');
const dashboardRoutes = require('./routes/dashboard');
const fixedInventoryRoutes = require('./routes/fixedInventory');

// Test error endpoint for security verification of global error handler
app.get('/api/trigger-error', (req, res, next) => {
  next(new Error('Internal Database Crash Mock'));
});

// FIX-21: Redirect and alias middleware from /api/* to /api/v1/* using 307 to preserve HTTP method and payload
app.use('/api', (req, res, next) => {
  if (req.path.startsWith('/v1')) {
    return next();
  }
  const newPath = `/api/v1${req.path}`;
  res.redirect(307, newPath);
});

// Use routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/inventory', inventoryRoutes);
app.use('/api/v1/categories', categoriesRoutes);
app.use('/api/v1/users', usersRoutes);
app.use('/api/v1/ae-requests', aeRequestsRoutes);
app.use('/api/v1/dashboard', dashboardRoutes);
app.use('/api/v1/fixed-inventory', fixedInventoryRoutes);

// Error handling middleware
// FIX-14: Replace error handling middleware to mask stack traces and raw error messages in production
app.use((err, req, res, next) => {
  console.error(`[ERROR] ${new Date().toISOString()} — ${err.stack}`);
  
  if (err.code === 'EBADCSRFTOKEN') {
    return res.status(403).json({ error: 'Invalid or missing CSRF token' });
  }

  const isDev = process.env.NODE_ENV !== 'production';
  res.status(err.status || 500).json({
    error: isDev ? err.message : 'An internal error occurred.',
    ...(isDev && { stack: err.stack })
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV}`);
  console.log(`🗄️  Database: ${process.env.DB_NAME}`);
});
