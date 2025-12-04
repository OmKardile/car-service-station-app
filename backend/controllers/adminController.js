const { User, Booking, Service, Station, StationServicePrice } = require('../models');
const logger = require('../utils/logger');

class AdminController {
  // Get all users (Admin/Superadmin only)
  static async getAllUsers(req, res) {
    try {
      const { role, isActive, limit = 20, page = 1 } = req.query;
      
      const whereCondition = {};
      if (role) whereCondition.role = role;
      if (isActive !== undefined) whereCondition.isActive = isActive === 'true';

      const offset = (page - 1) * limit;

      const { count, rows: users } = await User.findAndCountAll({
        where: whereCondition,
        attributes: { exclude: ['password', 'refreshToken'] },
        order: [['createdAt', 'DESC']],
        limit: parseInt(limit),
        offset: parseInt(offset)
      });

      res.json({
        success: true,
        data: users,
        pagination: {
          total: count,
          page: parseInt(page),
          totalPages: Math.ceil(count / limit),
          limit: parseInt(limit)
        }
      });
    } catch (error) {
      logger.error('Get all users error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get users'
      });
    }
  }

  // Get user by ID (Admin/Superadmin only)
  static async getUserById(req, res) {
    try {
      const { id } = req.params;

      const user = await User.findByPk(id, {
        attributes: { exclude: ['password', 'refreshToken'] },
        include: [{
          model: Booking,
          as: 'bookings',
          include: [
            { model: Service, as: 'service' },
            { model: Station, as: 'station' }
          ]
        }]
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: user
      });
    } catch (error) {
      logger.error('Get user by ID error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get user'
      });
    }
  }

  // Update user role/status (Admin/Superadmin only)
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { role, isActive } = req.body;

      const user = await User.findByPk(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Superadmin can update anyone, admin can only update clients
      if (req.user.role === 'admin' && user.role !== 'client') {
        return res.status(403).json({
          success: false,
          message: 'Not authorized to update this user'
        });
      }

      const updates = {};
      if (role !== undefined) updates.role = role;
      if (isActive !== undefined) updates.isActive = isActive;

      await user.update(updates);

      logger.info(`User updated: ${id} by ${req.user.role} ${req.user.userId}`);

      res.json({
        success: true,
        message: 'User updated successfully',
        data: user
      });
    } catch (error) {
      logger.error('Update user error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update user'
      });
    }
  }

  // Get all bookings (Admin/Superadmin only)
  static async getAllBookings(req, res) {
    try {
      const { status, stationId, serviceId, userId, limit = 20, page = 1 } = req.query;
      
      const whereCondition = {};
      if (status) whereCondition.status = status;
      if (stationId) whereCondition.stationId = stationId;
      if (serviceId) whereCondition.serviceId = serviceId;
      if (userId) whereCondition.userId = userId;

      const offset = (page - 1) * limit;

      const { count, rows: bookings } = await Booking.findAndCountAll({
        where: whereCondition,
        include: [
          { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
          { model: Service, as: 'service' },
          { model: Station, as: 'station' }
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
      logger.error('Get all bookings error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get bookings'
      });
    }
  }

  // Get booking analytics
  static async getBookingAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      
      const whereCondition = {};
      if (startDate && endDate) {
        whereCondition.createdAt = {
          [require('sequelize').Op.between]: [new Date(startDate), new Date(endDate)]
        };
      }

      // Get total bookings count
      const totalBookings = await Booking.count({ where: whereCondition });

      // Get bookings by status
      const bookingsByStatus = await Booking.findAll({
        where: whereCondition,
        attributes: [
          'status',
          [require('sequelize').fn('COUNT', require('sequelize').col('id')), 'count']
        ],
        group: ['status']
      });

      // Get bookings by service
      const bookingsByService = await Booking.findAll({
        where: whereCondition,
        include: [{ model: Service, as: 'service' }],
        attributes: [
          'serviceId',
          [require('sequelize').fn('COUNT', require('sequelize').col('Booking.id')), 'count']
        ],
        group: ['serviceId']
      });

      // Get bookings by station
      const bookingsByStation = await Booking.findAll({
        where: whereCondition,
        include: [{ model: Station, as: 'station' }],
        attributes: [
          'stationId',
          [require('sequelize').fn('COUNT', require('sequelize').col('Booking.id')), 'count']
        ],
        group: ['stationId']
      });

      // Get revenue
      const revenueResult = await Booking.findOne({
        where: whereCondition,
        attributes: [
          [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'totalRevenue']
        ]
      });

      res.json({
        success: true,
        data: {
          totalBookings,
          bookingsByStatus,
          bookingsByService,
          bookingsByStation,
          totalRevenue: revenueResult.dataValues.totalRevenue || 0
        }
      });
    } catch (error) {
      logger.error('Get booking analytics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get analytics'
      });
    }
  }

  // Update station service price (Admin only)
  static async updateStationServicePrice(req, res) {
    try {
      const { stationId, serviceId } = req.params;
      const { price, isActive } = req.body;

      const stationServicePrice = await StationServicePrice.findOne({
        where: { stationId, serviceId }
      });

      if (!stationServicePrice) {
        return res.status(404).json({
          success: false,
          message: 'Station service price not found'
        });
      }

      const updates = {};
      if (price !== undefined) updates.price = price;
      if (isActive !== undefined) updates.isActive = isActive;

      await stationServicePrice.update(updates);

      logger.info(`Station service price updated: station ${stationId}, service ${serviceId} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Station service price updated successfully',
        data: stationServicePrice
      });
    } catch (error) {
      logger.error('Update station service price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update station service price'
      });
    }
  }

  // Create station service price (Admin only)
  static async createStationServicePrice(req, res) {
    try {
      const { stationId, serviceId, price } = req.body;

      // Check if station exists
      const station = await Station.findByPk(stationId);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      // Check if service exists
      const service = await Service.findByPk(serviceId);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      // Check if price already exists
      const existingPrice = await StationServicePrice.findOne({
        where: { stationId, serviceId }
      });

      if (existingPrice) {
        return res.status(409).json({
          success: false,
          message: 'Service price already exists for this station'
        });
      }

      const stationServicePrice = await StationServicePrice.create({
        stationId,
        serviceId,
        price
      });

      logger.info(`Station service price created: station ${stationId}, service ${serviceId} by admin ${req.user.userId}`);

      res.status(201).json({
        success: true,
        message: 'Station service price created successfully',
        data: stationServicePrice
      });
    } catch (error) {
      logger.error('Create station service price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create station service price'
      });
    }
  }

  // Get system statistics
  static async getSystemStatistics(req, res) {
    try {
      const [
        totalUsers,
        totalBookings,
        activeBookings,
        totalStations,
        totalServices,
        todayBookings,
        revenueToday
      ] = await Promise.all([
        User.count(),
        Booking.count(),
        Booking.count({ where: { status: ['pending', 'confirmed', 'in_progress'] } }),
        Station.count(),
        Service.count(),
        Booking.count({
          where: {
            createdAt: {
              [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
            }
          }
        }),
        Booking.findOne({
          where: {
            createdAt: {
              [require('sequelize').Op.gte]: new Date(new Date().setHours(0, 0, 0, 0))
            }
          },
          attributes: [
            [require('sequelize').fn('SUM', require('sequelize').col('totalPrice')), 'total']
          ]
        })
      ]);

      res.json({
        success: true,
        data: {
          totalUsers,
          totalBookings,
          activeBookings,
          totalStations,
          totalServices,
          todayBookings,
          revenueToday: revenueToday.dataValues.total || 0
        }
      });
    } catch (error) {
      logger.error('Get system statistics error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get system statistics'
      });
    }
  }
}

module.exports = AdminController;