const { Message, Booking, User } = require('../models');
const logger = require('../utils/logger');

class ChatController {
  // Get messages for a booking
  static async getMessages(req, res) {
    try {
      const { bookingId } = req.params;
      const userId = req.user.userId;

      // Verify user has access to this booking
      const booking = await Booking.findOne({
        where: { 
          id: bookingId,
          [require('sequelize').Op.or]: [
            { userId }, // User is the booking owner
            { '$user.role$': { [require('sequelize').Op.in]: ['admin', 'superadmin'] } } // Or user is admin
          ]
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      const messages = await Message.findAll({
        where: { bookingId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }],
        order: [['createdAt', 'ASC']]
      });

      // Mark messages as read for current user
      await Message.update(
        { isRead: true },
        {
          where: {
            bookingId,
            userId: { [require('sequelize').Op.ne]: userId },
            isRead: false
          }
        }
      );

      res.json({
        success: true,
        data: messages
      });
    } catch (error) {
      logger.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get messages'
      });
    }
  }

  // Send message
  static async sendMessage(req, res) {
    try {
      const { bookingId, message, attachmentUrl } = req.body;
      const userId = req.user.userId;

      // Verify user has access to this booking
      const booking = await Booking.findOne({
        where: { 
          id: bookingId,
          [require('sequelize').Op.or]: [
            { userId }, // User is the booking owner
            { '$user.role$': { [require('sequelize').Op.in]: ['admin', 'superadmin'] } } // Or user is admin
          ]
        },
        include: [{
          model: User,
          as: 'user'
        }]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found or access denied'
        });
      }

      const newMessage = await Message.create({
        bookingId,
        userId,
        message,
        attachmentUrl,
        messageType: attachmentUrl ? 'file' : 'text'
      });

      // Get populated message
      const populatedMessage = await Message.findByPk(newMessage.id, {
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'firstName', 'lastName', 'email', 'role']
        }]
      });

      logger.info(`Message sent: booking ${bookingId} by user ${userId}`);

      res.status(201).json({
        success: true,
        message: 'Message sent successfully',
        data: populatedMessage
      });
    } catch (error) {
      logger.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to send message'
      });
    }
  }

  // Upload file for chat
  static async uploadFile(req, res) {
    try {
      if (!req.file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      const fileUrl = `/uploads/${req.file.filename}`;

      logger.info(`File uploaded: ${req.file.filename} by user ${req.user.userId}`);

      res.json({
        success: true,
        message: 'File uploaded successfully',
        data: {
          url: fileUrl,
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size
        }
      });
    } catch (error) {
      logger.error('Upload file error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to upload file'
      });
    }
  }

  // Get unread message count
  static async getUnreadCount(req, res) {
    try {
      const userId = req.user.userId;

      // Get bookings where user is involved
      const userBookings = await Booking.findAll({
        where: { userId },
        attributes: ['id']
      });

      const bookingIds = userBookings.map(booking => booking.id);

      const unreadCount = await Message.count({
        where: {
          bookingId: bookingIds,
          userId: { [require('sequelize').Op.ne]: userId },
          isRead: false
        }
      });

      res.json({
        success: true,
        data: { unreadCount }
      });
    } catch (error) {
      logger.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get unread count'
      });
    }
  }
}

module.exports = ChatController;