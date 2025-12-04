const { Sequelize, DataTypes } = require('sequelize');
const config = require('../config/database')[process.env.NODE_ENV || 'development'];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  {
    host: config.host,
    dialect: config.dialect,
    logging: config.logging,
    pool: config.pool
  }
);

const db = {};

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Import models
db.User = require('./User')(sequelize, DataTypes);
db.Station = require('./Station')(sequelize, DataTypes);
db.Service = require('./Service')(sequelize, DataTypes);
db.StationServicePrice = require('./StationServicePrice')(sequelize, DataTypes);
db.Booking = require('./Booking')(sequelize, DataTypes);
db.BookingStatusHistory = require('./BookingStatusHistory')(sequelize, DataTypes);
db.Receipt = require('./Receipt')(sequelize, DataTypes);
db.Message = require('./Message')(sequelize, DataTypes);

// Define associations
db.User.associate(db);
db.Station.associate(db);
db.Service.associate(db);
db.StationServicePrice.associate(db);
db.Booking.associate(db);
db.BookingStatusHistory.associate(db);
db.Receipt.associate(db);
db.Message.associate(db);

module.exports = db;