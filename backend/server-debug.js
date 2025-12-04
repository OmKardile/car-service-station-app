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

console.log('🚀 Starting debug server...');

// Simple middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logging
app.use((req, res, next) => {
  console.log(`📥 ${req.method} ${req.url}`);
  console.log('📝 Body:', req.body);
  next();
});

// Test database connection
console.log('🔌 Testing database connection...');
const { sequelize } = require('./models');
sequelize.authenticate()
  .then(() => {
    console.log('✅ Database connected successfully');
  })
  .catch(err => {
    console.error('❌ Database connection error:', err);
    process.exit(1);
  });

// Simple test route
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'Debug server is running',
    timestamp: new Date().toISOString()
  });
});

// Test registration with detailed logging
app.post('/api/auth/register-debug', async (req, res) => {
  console.log('🔍 Registration attempt received:');
  console.log('📋 Request body:', req.body);
  
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    // Validate required fields
    if (!email || !password || !firstName || !lastName) {
      console.log('❌ Missing required fields');
      return res.status(400).json({
        success: false,
        message: 'Missing required fields',
        received: req.body
      });
    }
    
    console.log('📊 Checking database...');
    
    // Import User model
    const { User } = require('./models');
    
    // Check if user exists
    console.log(`🔎 Checking if user ${email} exists...`);
    const existingUser = await User.findOne({ where: { email } });
    
    if (existingUser) {
      console.log('❌ User already exists');
      return res.status(409).json({
        success: false,
        message: 'User already exists with this email'
      });
    }
    
    console.log('✅ User does not exist, creating...');
    
    // Hash password
    const bcrypt = require('bcryptjs');
    const hashedPassword = await bcrypt.hash(password, 12);
    console.log('🔒 Password hashed');
    
    // Create user
    const user = await User.create({
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone,
      role: 'client'
    });
    
    console.log('✅ User created with ID:', user.id);
    
    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          phone: user.phone,
          role: user.role
        }
      }
    });
    
  } catch (error) {
    console.error('💥 Registration error:', error);
    console.error('📋 Error stack:', error.stack);
    
    res.status(500).json({
      success: false,
      message: 'Registration failed',
      error: error.message,
      stack: error.stack
    });
  }
});

// Test existing registration endpoint
const authRouter = require('./routes/auth');
app.use('/api/auth', authRouter);

// Error handler
app.use((err, req, res, next) => {
  console.error('🔥 Error handler caught:', err);
  res.status(500).json({
    success: false,
    message: 'Internal server error',
    error: err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  console.log('🔍 404 - Route not found:', req.originalUrl);
  res.status(404).json({
    success: false,
    message: 'Route not found'
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Debug server running on port ${PORT}`);
  console.log(`🌐 Test endpoints:`);
  console.log(`   GET  http://localhost:${PORT}/health`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register-debug`);
  console.log(`   POST http://localhost:${PORT}/api/auth/register`);
});