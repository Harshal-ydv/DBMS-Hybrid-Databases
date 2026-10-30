const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const config = require('./config/env');
const { getMySQLConnection, getMongoConnection } = require('./config/database');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/health', async (req, res) => {
  try {
    const mysqlPool = await getMySQLConnection();
    const { db: mongoDb } = await getMongoConnection();
    
    // Test MySQL connection
    await mysqlPool.query('SELECT 1');
    
    // Test MongoDB connection
    await mongoDb.admin().ping();
    
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      databases: {
        mysql: 'connected',
        mongodb: 'connected'
      }
    });
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      error: error.message
    });
  }
});

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    message: 'Food Delivery System API - Hybrid Database Architecture',
    version: '1.0.0',
    endpoints: {
      health: '/health',
      restaurants: '/api/restaurants',
      menus: '/api/menus',
      orders: '/api/orders',
      reviews: '/api/reviews',
      events: '/api/events',
      analytics: '/api/analytics'
    }
  });
});

// API Routes
app.use('/api/restaurants', require('./routes/restaurants'));
app.use('/api/orders', require('./routes/orders'));
app.use('/api/analytics', require('./routes/analytics'));
app.use('/api/menus', require('./routes/menus'));
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/events', require('./routes/events'));

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    error: 'Route not found',
    path: req.path
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error',
    ...(config.server.env === 'development' && { stack: err.stack })
  });
});

// Initialize connections and start server
const startServer = async () => {
  try {
    console.log('🚀 Starting Food Delivery System API...');
    console.log('📊 Environment:', config.server.env);
    
    // Initialize MySQL connection (required)
    await getMySQLConnection();
    
    // Try MongoDB connection (optional for now)
    try {
      await getMongoConnection();
      console.log('✅ MongoDB connected (all features available)');
    } catch (mongoError) {
      console.warn('⚠️  MongoDB connection failed - some features will be unavailable');
      console.warn('   Menu and review features require MongoDB');
      console.warn('   You can still test MySQL features (orders, users, restaurants)');
    }
    
    // Start Express server
    app.listen(config.server.port, () => {
      console.log(`\n✅ Server running on port ${config.server.port}`);
      console.log(`🌐 API URL: http://localhost:${config.server.port}`);
      console.log(`💚 Health check: http://localhost:${config.server.port}/health\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

module.exports = app;
