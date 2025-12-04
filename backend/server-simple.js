require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Test route
app.get('/test', (req, res) => {
  res.json({ 
    success: true, 
    message: 'Server is working',
    timestamp: new Date().toISOString()
  });
});

// Simple register endpoint
app.post('/api/auth/register-simple', (req, res) => {
  try {
    const { email, password, firstName, lastName, phone } = req.body;
    
    console.log('Registration attempt:', { email, firstName, lastName });
    
    // Basic validation
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields'
      });
    }
    
    res.status(201).json({
      success: true,
      message: 'Registration successful (test endpoint)',
      data: {
        user: {
          email,
          firstName,
          lastName,
          phone
        }
      }
    });
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error',
      error: error.message
    });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Simple test server running on port ${PORT}`);
});