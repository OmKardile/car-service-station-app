module.exports = (sequelize, DataTypes) => {
  const Service = sequelize.define('Service', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    basePrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    estimatedDuration: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'services',
    timestamps: true
  });

  Service.associate = function(models) {
    Service.hasMany(models.StationServicePrice, {
      foreignKey: 'serviceId',
      as: 'stationPrices'
    });
    Service.hasMany(models.Booking, {
      foreignKey: 'serviceId',
      as: 'bookings'
    });
  };

  return Service;
};