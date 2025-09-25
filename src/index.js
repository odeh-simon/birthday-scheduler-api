require('dotenv').config();
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');

const connectDB = require('./config/db');
const logger = require('./config/logger');
const { createUser, getAllUsers, getBirthdayUsers, validateUser } = require('./controllers/userController');
const { startCronJob } = require('./services/cronService');
const { testEmailConfiguration } = require('./services/emailService');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.path}`, {
    ip: req.ip,
    userAgent: req.get('User-Agent'),
    body: req.method === 'POST' ? req.body : undefined
  });
  next();
});

// Routes
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Birthday Wisher API is running!',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Health check endpoint
app.get('/health', (req, res) => {
  const healthStatus = {
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  };
  
  logger.info('Health check requested', healthStatus);
  res.json(healthStatus);
});

// User routes
app.post('/users', validateUser, createUser);
app.get('/users', getAllUsers);
app.get('/users/birthdays', getBirthdayUsers);

// Test email configuration endpoint
app.get('/test-email', async (req, res) => {
  try {
    const isEmailConfigured = await testEmailConfiguration();
    
    if (isEmailConfigured) {
      res.json({
        success: true,
        message: 'Email configuration is valid'
      });
    } else {
      res.status(500).json({
        success: false,
        message: 'Email configuration is invalid'
      });
    }
  } catch (error) {
    logger.error('Email configuration test failed:', error);
    res.status(500).json({
      success: false,
      message: 'Email configuration test failed'
    });
  }
});

// Manual trigger for birthday emails (for testing)
app.post('/trigger-birthday-emails', async (req, res) => {
  try {
    const { triggerBirthdayEmails } = require('./services/cronService');
    await triggerBirthdayEmails();
    
    res.json({
      success: true,
      message: 'Birthday emails triggered successfully'
    });
  } catch (error) {
    logger.error('Failed to trigger birthday emails:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to trigger birthday emails'
    });
  }
});

// 404 handler
app.use((req, res) => {
  logger.warn(`Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Global error handler
app.use((error, req, res, next) => {
  logger.error('Unhandled error:', {
    error: error.message,
    stack: error.stack,
    url: req.url,
    method: req.method
  });

  // Don't leak error details in production
  const isDevelopment = process.env.NODE_ENV === 'development';
  
  res.status(error.status || 500).json({
    success: false,
    message: isDevelopment ? error.message : 'Internal server error',
    ...(isDevelopment && { stack: error.stack })
  });
});

// Graceful shutdown
const gracefulShutdown = (signal) => {
  logger.info(`Received ${signal}. Starting graceful shutdown...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
    
    mongoose.connection.close(false, () => {
      logger.info('MongoDB connection closed');
      process.exit(0);
    });
  });
};

// Handle shutdown signals
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Start server
const startServer = async () => {
  try {
    // Connect to database
    await connectDB();
    
    // Test email configuration
    const isEmailConfigured = await testEmailConfiguration();
    if (!isEmailConfigured) {
      logger.warn('Email configuration is invalid. Birthday emails may not work properly.');
    }
    
    // Start cron job
    startCronJob();
    
    // Start server
    const server = app.listen(PORT, () => {
      logger.info(`Server running on port ${PORT}`, {
        port: PORT,
        environment: process.env.NODE_ENV || 'development',
        emailConfigured: isEmailConfigured
      });
    });
    
    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

// Start the application
let server;
startServer().then(s => {
  server = s;
});

module.exports = app;
