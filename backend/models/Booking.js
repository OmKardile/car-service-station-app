module.exports = (sequelize, DataTypes) => {
  const Booking = sequelize.define('Booking', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    serviceId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'services',
        key: 'id'
      }
    },
    stationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stations',
        key: 'id'
      }
    },
    scheduledDate: {
      type: DataTypes.DATE,
      allowNull: false
    },
    vehicleDetails: {
      type: DataTypes.JSON,
      allowNull: false
    },
    totalPrice: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
      defaultValue: 'pending'
    },
    specialInstructions: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'bookings',
    timestamps: true
  });

  Booking.associate = function(models) {
    Booking.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
    Booking.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });
    Booking.belongsTo(models.Station, {
      foreignKey: 'stationId',
      as: 'station'
    });
    Booking.hasMany(models.BookingStatusHistory, {
      foreignKey: 'bookingId',
      as: 'statusHistory'
    });
    Booking.hasOne(models.Receipt, {
      foreignKey: 'bookingId',
      as: 'receipt'
    });
    Booking.hasMany(models.Message, {
      foreignKey: 'bookingId',
      as: 'messages'
    });
  };

  return Booking;
};