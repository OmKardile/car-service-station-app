const { Station, StationServicePrice, Service } = require('../models');
const logger = require('../utils/logger');

class StationController {
  // Get all stations
  static async getAllStations(req, res) {
    try {
      const stations = await Station.findAll({
        where: { isActive: true },
        include: [{
          model: StationServicePrice,
          as: 'servicePrices',
          include: [{
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description']
          }]
        }]
      });

      res.json({
        success: true,
        data: stations
      });
    } catch (error) {
      logger.error('Get stations error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get stations'
      });
    }
  }

  // Get station by ID
  static async getStationById(req, res) {
    try {
      const { id } = req.params;

      const station = await Station.findByPk(id, {
        include: [{
          model: StationServicePrice,
          as: 'servicePrices',
          include: [{
            model: Service,
            as: 'service',
            attributes: ['id', 'name', 'description', 'basePrice', 'estimatedDuration']
          }]
        }]
      });

      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      res.json({
        success: true,
        data: station
      });
    } catch (error) {
      logger.error('Get station error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get station'
      });
    }
  }

  // Create new station (Admin only)
  static async createStation(req, res) {
    try {
      const { name, address, phone, email, operatingHours } = req.body;

      const station = await Station.create({
        name,
        address,
        phone,
        email,
        operatingHours
      });

      logger.info(`Station created: ${name} by admin ${req.user.userId}`);

      res.status(201).json({
        success: true,
        message: 'Station created successfully',
        data: station
      });
    } catch (error) {
      logger.error('Create station error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create station'
      });
    }
  }

  // Update station (Admin only)
  static async updateStation(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const station = await Station.findByPk(id);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      await station.update(updates);

      logger.info(`Station updated: ${id} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Station updated successfully',
        data: station
      });
    } catch (error) {
      logger.error('Update station error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update station'
      });
    }
  }

  // Delete station (Admin only)
  static async deleteStation(req, res) {
    try {
      const { id } = req.params;

      const station = await Station.findByPk(id);
      if (!station) {
        return res.status(404).json({
          success: false,
          message: 'Station not found'
        });
      }

      await station.update({ isActive: false });

      logger.info(`Station deleted: ${id} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Station deleted successfully'
      });
    } catch (error) {
      logger.error('Delete station error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete station'
      });
    }
  }

  // Get station service price
  static async getStationServicePrice(req, res) {
    try {
      const { stationId, serviceId } = req.params;

      const price = await StationServicePrice.findOne({
        where: { stationId, serviceId, isActive: true },
        include: [
          { model: Station, as: 'station' },
          { model: Service, as: 'service' }
        ]
      });

      if (!price) {
        return res.status(404).json({
          success: false,
          message: 'Service price not found for this station'
        });
      }

      res.json({
        success: true,
        data: price
      });
    } catch (error) {
      logger.error('Get station service price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service price'
      });
    }
  }

  // Update station service price (Admin only)
  static async updateStationServicePrice(req, res) {
    try {
      const { stationId, serviceId } = req.params;
      const { price } = req.body;

      const stationServicePrice = await StationServicePrice.findOne({
        where: { stationId, serviceId }
      });

      if (!stationServicePrice) {
        return res.status(404).json({
          success: false,
          message: 'Service price not found'
        });
      }

      await stationServicePrice.update({ price });

      logger.info(`Station service price updated: station ${stationId}, service ${serviceId} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Service price updated successfully',
        data: stationServicePrice
      });
    } catch (error) {
      logger.error('Update station service price error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service price'
      });
    }
  }
}

module.exports = StationController;