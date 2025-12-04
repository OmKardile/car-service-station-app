const { Service, StationServicePrice, Station } = require('../models');
const logger = require('../utils/logger');

class ServiceController {
  // Get all services
  static async getAllServices(req, res) {
    try {
      const services = await Service.findAll({
        where: { isActive: true },
        include: [{
          model: StationServicePrice,
          as: 'stationPrices',
          include: [{
            model: Station,
            as: 'station',
            attributes: ['id', 'name', 'address']
          }]
        }]
      });

      res.json({
        success: true,
        data: services
      });
    } catch (error) {
      logger.error('Get services error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get services'
      });
    }
  }

  // Get service by ID
  static async getServiceById(req, res) {
    try {
      const { id } = req.params;

      const service = await Service.findByPk(id, {
        include: [{
          model: StationServicePrice,
          as: 'stationPrices',
          include: [{
            model: Station,
            as: 'station',
            attributes: ['id', 'name', 'address', 'phone', 'email', 'operatingHours']
          }]
        }]
      });

      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      res.json({
        success: true,
        data: service
      });
    } catch (error) {
      logger.error('Get service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get service'
      });
    }
  }

  // Get services by station ID
  static async getServicesByStation(req, res) {
    try {
      const { stationId } = req.params;

      const stationServices = await StationServicePrice.findAll({
        where: { 
          stationId,
          isActive: true 
        },
        include: [{
          model: Service,
          as: 'service'
        }, {
          model: Station,
          as: 'station',
          attributes: ['id', 'name', 'address']
        }]
      });

      res.json({
        success: true,
        data: stationServices
      });
    } catch (error) {
      logger.error('Get station services error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get station services'
      });
    }
  }

  // Create new service (Admin only)
  static async createService(req, res) {
    try {
      const { name, description, basePrice, estimatedDuration } = req.body;

      const service = await Service.create({
        name,
        description,
        basePrice,
        estimatedDuration
      });

      logger.info(`Service created: ${name} by admin ${req.user.userId}`);

      res.status(201).json({
        success: true,
        message: 'Service created successfully',
        data: service
      });
    } catch (error) {
      logger.error('Create service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to create service'
      });
    }
  }

  // Update service (Admin only)
  static async updateService(req, res) {
    try {
      const { id } = req.params;
      const updates = req.body;

      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      await service.update(updates);

      logger.info(`Service updated: ${id} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Service updated successfully',
        data: service
      });
    } catch (error) {
      logger.error('Update service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to update service'
      });
    }
  }

  // Delete service (Admin only)
  static async deleteService(req, res) {
    try {
      const { id } = req.params;

      const service = await Service.findByPk(id);
      if (!service) {
        return res.status(404).json({
          success: false,
          message: 'Service not found'
        });
      }

      await service.update({ isActive: false });

      logger.info(`Service deleted: ${id} by admin ${req.user.userId}`);

      res.json({
        success: true,
        message: 'Service deleted successfully'
      });
    } catch (error) {
      logger.error('Delete service error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to delete service'
      });
    }
  }
}

module.exports = ServiceController;