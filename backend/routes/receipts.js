const express = require('express');
const router = express.Router();
const ReceiptController = require('../controllers/receiptController');
const { authenticate } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

// Generate receipt
router.post('/booking/:bookingId/generate', ReceiptController.generateReceipt);

// Get receipt
router.get('/booking/:bookingId', ReceiptController.getReceiptByBooking);

// Generate PDF receipt
router.get('/booking/:bookingId/pdf', ReceiptController.generatePDFReceipt);

module.exports = router;