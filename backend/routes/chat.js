const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ChatController = require('../controllers/chatController');
const { authenticate } = require('../middleware/auth');
const upload = require('../middleware/upload');
const { validate } = require('../middleware/validation');

// All routes require authentication
router.use(authenticate);

// Get messages for a booking
router.get('/booking/:bookingId/messages', ChatController.getMessages);

// Send message
router.post(
  '/messages',
  validate([
    body('bookingId').isInt(),
    body('message').notEmpty(),
    body('attachmentUrl').optional().isURL()
  ]),
  ChatController.sendMessage
);

// Upload file
router.post(
  '/upload',
  upload.single('file'),
  ChatController.uploadFile
);

// Get unread count
router.get('/unread-count', ChatController.getUnreadCount);

module.exports = router;