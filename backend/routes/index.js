const express = require('express');
const router = express.Router();

// Import all routes
const authRoutes = require('./auth');
const serviceRoutes = require('./services');
const stationRoutes = require('./stations');
const bookingRoutes = require('./bookings');
const adminRoutes = require('./admin');
const chatRoutes = require('./chat');
const receiptRoutes = require('./receipts');

// Use routes
router.use('/auth', authRoutes);
router.use('/services', serviceRoutes);
router.use('/stations', stationRoutes);
router.use('/bookings', bookingRoutes);
router.use('/admin', adminRoutes);
router.use('/chat', chatRoutes);
router.use('/receipts', receiptRoutes);

module.exports = router;