const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Use routes
app.use('/api/auth', authRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/users', usersRoutes);
app.use('/api/ae-requests', aeRequestsRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    message: err.message 
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
