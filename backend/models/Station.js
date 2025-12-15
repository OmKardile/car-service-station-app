module.exports = (sequelize, DataTypes) => {
  const Station = sequelize.define('Station', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    name: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    address: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: true,
      validate: {
        isEmail: true
      }
    },
    adminId: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    operatingHours: {
      type: DataTypes.STRING(100),
      allowNull: true
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'stations',
    timestamps: true
  });

  Station.associate = function(models) {
    Station.belongsTo(models.User, {
      foreignKey: 'adminId',
      as: 'admin'
    });
    Station.hasMany(models.StationServicePrice, {
      foreignKey: 'stationId',
      as: 'servicePrices'
    });
    Station.hasMany(models.Booking, {
      foreignKey: 'stationId',
      as: 'bookings'
    });
  };

  return Station;
};