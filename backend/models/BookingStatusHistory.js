module.exports = (sequelize, DataTypes) => {
  const BookingStatusHistory = sequelize.define('BookingStatusHistory', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    bookingId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'bookings',
        key: 'id'
      }
    },
    status: {
      type: DataTypes.ENUM('pending', 'confirmed', 'in_progress', 'completed', 'cancelled'),
      allowNull: false
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    changedBy: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    }
  }, {
    tableName: 'booking_status_history',
    timestamps: true
  });

  BookingStatusHistory.associate = function(models) {
    BookingStatusHistory.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
    BookingStatusHistory.belongsTo(models.User, {
      foreignKey: 'changedBy',
      as: 'changedByUser'
    });
  };

  return BookingStatusHistory;
};