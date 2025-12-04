const { sequelize } = require('../models');
const logger = require('./logger');

class DatabaseService {
  static async connect() {
    try {
      await sequelize.authenticate();
      logger.info('Database connected successfully');
      return true;
    } catch (error) {
      logger.error('Database connection failed:', error);
      throw error;
    }
  }

  static async sync(options = {}) {
    try {
      await sequelize.sync(options);
      logger.info('Database synced successfully');
      return true;
    } catch (error) {
      logger.error('Database sync failed:', error);
      throw error;
    }
  }

  static async disconnect() {
    try {
      await sequelize.close();
      logger.info('Database disconnected successfully');
      return true;
    } catch (error) {
      logger.error('Database disconnect failed:', error);
      throw error;
    }
  }

  static async transaction(callback) {
    const transaction = await sequelize.transaction();
    try {
      const result = await callback(transaction);
      await transaction.commit();
      return result;
    } catch (error) {
      await transaction.rollback();
      throw error;
    }
  }
}

module.exports = DatabaseService;