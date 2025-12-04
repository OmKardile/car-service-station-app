const { Booking, Service, Station, User, BookingStatusHistory } = require('../models');
const logger = require('../utils/logger');
const moment = require('moment');

class BookingController {
  // Create new booking
  static async createBooking(req, res) {
    try {
      const { serviceId, stationId, scheduledDate, vehicleDetails, specialInstructions } = req.body;
      const userId = req.user.userId;

      // Check if service exists and is active
      const service = await Service.findByPk(serviceId);
      if (!service || !service.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Service not found or inactive'
        });
      }

      // Check if station exists and is active
      const station = await Station.findByPk(stationId);
      if (!station || !station.isActive) {
        return res.status(404).json({
          success: false,
          message: 'Station not found or inactive'
        });
      }

      // Check station service price
      const stationServicePrice = await require('../models').StationServicePrice.findOne({
        where: { stationId, serviceId, isActive: true }
      });

      if (!stationServicePrice) {
        return res.status(404).json({
          success: false,
          message: 'Service not available at this station'
        });
      }

      // Validate scheduled date (must be in future)
      const scheduledDateTime = new Date(scheduledDate);
      const now = new Date();
      
      if (scheduledDateTime < now) {
        return res.status(400).json({
          success: false,
          message: 'Scheduled date must be in the future'
        });
      }

      // Check if station is open at scheduled time
      const dayOfWeek = scheduledDateTime.getDay(); // 0 = Sunday, 1 = Monday, etc.
      const hours = scheduledDateTime.getHours();
      const minutes = scheduledDateTime.getMinutes();
      
      // Basic time validation (you can implement more sophisticated logic)
      if (hours < 8 || hours > 18) {
        return res.status(400).json({
          success: false,
          message: 'Station is closed at this time (operating hours: 8:00 AM - 6:00 PM)'
        });
      }

      // Check for existing booking at same time
      const existingBooking = await Booking.findOne({
        where: {
          stationId,
          scheduledDate: {
            [require('sequelize').Op.between]: [
              moment(scheduledDateTime).subtract(service.estimatedDuration, 'minutes').toDate(),
              moment(scheduledDateTime).add(service.estimatedDuration, 'minutes').toDate()
            ]
          },
          status: ['pending', 'confirmed', 'in_progress']
        }
      });

      if (existingBooking) {
        return res.status(409).json({
          success: false,
          message: 'Time slot not available. Please choose another time.'
        });
      }

      // Create booking
      const booking = await Booking.create({
        userId,
        serviceId,
        stationId,
        scheduledDate: scheduledDateTime,
        vehicleDetails,
        totalPrice: stationServicePrice.price,
        specialInstructions,
        status: 'pending'
      });

      // Create status history entry
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status: 'pending',
        notes: 'Booking created',
        changedBy: userId
      });

      logger.info(`Booking created: ${booking.id} by user ${userId}`);

      // Populate booking with related data
      const populatedBooking = await Booking.findByPk(booking.id, {
        include: [
          { model: Service, as: 'service' },
          { model: Station, as: 'station' },
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }
        ]
      });

      res.status(201).json({
        success: true,
        message: 'Booking created successfully',
        data: populatedBooking
      });
    } catch (error) {
      logger.error('Create booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create booking',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Get all bookings for current user
  static async getUserBookings(req, res) {
    try {
      const userId = req.user.userId;
      const { status, limit = 10, page = 1 } = req.query;

      const whereCondition = { userId };
      if (status) {
        whereCondition.status = status;
      }

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where: whereCondition,
        include: [
          { model: Service, as: 'service' },
          { model: Station, as: 'station' },
          { 
            model: BookingStatusHistory, 
            as: 'statusHistory',
            limit: 1,
            order: [['createdAt', 'DESC']]
          }
        ],
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: bookings,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Get user bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings'
      });
    }
  }

  // Get booking by ID
  static async getBookingById(req, res) {
    try {
      const { id } = req.params;
      const userId = req.user.userId;

      const booking = await Booking.findOne({
        where: { 
          id,
          userId // Users can only see their own bookings
        },
        include: [
          { model: Service, as: 'service' },
          { model: Station, as: 'station' },
          { 
            model: User, 
            as: 'user',
            attributes: ['id', 'firstName', 'lastName', 'email', 'phone']
          },
          { 
            model: BookingStatusHistory, 
            as: 'statusHistory',
            order: [['createdAt', 'DESC']]
          }
        ]
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      res.json({
        success: true,
        data: booking
      });
    } catch (error) {
      logger.error('Get booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get booking'
      });
    }
  }

  // Update booking status
  static async updateBookingStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, notes } = req.body;
      const userId = req.user.userId;

      const booking = await Booking.findByPk(id);
      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check permissions
      if (req.user.role === 'client' && booking.userId !== userId) {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this booking'
        });
      }

      // Validate status transition
      const validStatuses = ['pending', 'confirmed', 'in_progress', 'completed', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid status'
        });
      }

      // Update booking status
      await booking.update({ status });

      // Create status history entry
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status,
        notes: notes || `Status changed to ${status}`,
        changedBy: userId
      });

      logger.info(`Booking status updated: ${id} to ${status} by user ${userId}`);

      res.json({
        success: true,
        message: 'Booking status updated successfully',
        data: booking
      });
    } catch (error) {
      logger.error('Update booking status error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update booking status'
      });
    }
  }

  // Cancel booking
  static async cancelBooking(req, res) {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const userId = req.user.userId;

      const booking = await Booking.findOne({
        where: { 
          id,
          userId // Users can only cancel their own bookings
        }
      });

      if (!booking) {
        return res.status(404).json({
          success: false,
          message: 'Booking not found'
        });
      }

      // Check if booking can be cancelled
      if (booking.status === 'cancelled') {
        return res.status(400).json({
          success: false,
          message: 'Booking is already cancelled'
        });
      }

      if (booking.status === 'completed') {
        return res.status(400).json({
          success: false,
          message: 'Cannot cancel completed booking'
        });
      }

      // Update booking status
      await booking.update({ status: 'cancelled' });

      // Create status history entry
      await BookingStatusHistory.create({
        bookingId: booking.id,
        status: 'cancelled',
        notes: reason || 'Booking cancelled by user',
        changedBy: userId
      });

      logger.info(`Booking cancelled: ${id} by user ${userId}`);

      res.json({
        success: true,
        message: 'Booking cancelled successfully'
      });
    } catch (error) {
      logger.error('Cancel booking error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to cancel booking'
      });
    }
  }

  // Get available time slots for station and service
  static async getAvailableTimeSlots(req, res) {
    try {
      const { stationId, serviceId, date } = req.query;

      if (!stationId || !serviceId || !date) {
        return res.status(400).json({
          success: false,
          message: 'Station ID, Service ID, and Date are required'
        });
      }

      // Check station and service
      const station = await Station.findByPk(stationId);
      const service = await Service.findByPk(serviceId);

      if (!station || !service) {
        return res.status(404).json({
          success: false,
          message: 'Station or Service not found'
        });
      }

      const selectedDate = new Date(date);
      const startOfDay = new Date(selectedDate.setHours(8, 0, 0, 0)); // Station opens at 8 AM
      const endOfDay = new Date(selectedDate.setHours(18, 0, 0, 0)); // Station closes at 6 PM

      // Get existing bookings for the day
      const existingBookings = await Booking.findAll({
        where: {
          stationId,
          serviceId,
          scheduledDate: {
            [require('sequelize').Op.between]: [startOfDay, endOfDay]
          },
          status: ['pending', 'confirmed', 'in_progress']
        }
      });

      // Generate time slots (every 30 minutes from 8 AM to 6 PM)
      const timeSlots = [];
      const slotDuration = 30; // minutes
      const currentTime = new Date(startOfDay);

      while (currentTime < endOfDay) {
        const slotEnd = new Date(currentTime.getTime() + service.estimatedDuration * 60000);
        
        // Check if slot is available
        const isAvailable = !existingBookings.some(booking => {
          const bookingStart = new Date(booking.scheduledDate);
          const bookingEnd = new Date(bookingStart.getTime() + service.estimatedDuration * 60000);
          
          return (
            (currentTime >= bookingStart && currentTime < bookingEnd) ||
            (slotEnd > bookingStart && slotEnd <= bookingEnd) ||
            (currentTime <= bookingStart && slotEnd >= bookingEnd)
          );
        });

        // Only add slots that are in the future
        const isFuture = currentTime > new Date();

        timeSlots.push({
          startTime: new Date(currentTime),
          endTime: slotEnd,
          isAvailable: isAvailable && isFuture,
          displayTime: currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        });

        currentTime.setMinutes(currentTime.getMinutes() + slotDuration);
      }

      res.json({
        success: true,
        data: {
          station,
          service,
          date: selectedDate.toISOString().split('T')[0],
          timeSlots
        }
      });
    } catch (error) {
      logger.error('Get time slots error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get available time slots'
      });
    }
  }
}

module.exports = BookingController;