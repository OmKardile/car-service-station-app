require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const { createServer } = require('http');
const { Server } = require('socket.io');
const path = require('path');
const fs = require('fs');

const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:8081",
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Import utilities
const logger = require('./utils/logger');
const DatabaseService = require('./utils/database');
const errorHandler = require('./middleware/errorHandler');

// Ensure necessary directories exist
const uploadsDir = path.join(__dirname, 'uploads');
const logsDir = path.join(__dirname, 'logs');
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });
if (!fs.existsSync(logsDir)) fs.mkdirSync(logsDir, { recursive: true });

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100,
  message: 'Too many requests from this IP, please try again later.'
});

// Middleware
app.use(helmet());
app.use(compression());
app.use(limiter);
app.use(cors()); // Allow all origins for development
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use('/uploads', express.static(uploadsDir));

// Request logging middleware
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.url} - IP: ${req.ip}`);
  next();
});

// Database connection
DatabaseService.connect()
  .then(() => {
    logger.info('Database connected successfully');
    
    // Sync database (use with caution in production)
    if (process.env.NODE_ENV !== 'production') {
      DatabaseService.sync({ alter: true }).catch(err => {
        logger.warn('Database sync warning:', err.message);
      });
    }
  })
  .catch(err => {
    logger.error('Failed to connect to database:', err);
    process.exit(1);
  });

// Routes
const routes = require('./routes');
app.use('/api', routes);

// Health check endpoint
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    version: '1.0.0'
  });
});

// Socket.IO for real-time chat
io.on('connection', (socket) => {
  logger.info(`Socket connected: ${socket.id}`);

  socket.on('join-booking-room', (bookingId) => {
    socket.join(`booking-${bookingId}`);
    logger.info(`Socket ${socket.id} joined booking-${bookingId}`);
  });

  socket.on('send-message', (data) => {
    socket.to(`booking-${data.bookingId}`).emit('receive-message', data);
    logger.info(`Message sent to booking-${data.bookingId}`);
  });

  socket.on('typing', (data) => {
    socket.to(`booking-${data.bookingId}`).emit('user-typing', {
      userId: data.userId,
      isTyping: data.isTyping
    });
  });

  socket.on('disconnect', () => {
    logger.info(`Socket disconnected: ${socket.id}`);
  });
});

// Error handling (must be last)
app.use(errorHandler);

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

// Graceful shutdown
process.on('SIGTERM', async () => {
  logger.info('SIGTERM received. Closing server gracefully...');
  await DatabaseService.disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', async () => {
  logger.info('SIGINT received. Closing server gracefully...');
  await DatabaseService.disconnect();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`);
  logger.info(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
  logger.info(`🔗 Client URL: ${process.env.CLIENT_URL || 'http://localhost:8081'}`);
});

module.exports = { app, io, server };