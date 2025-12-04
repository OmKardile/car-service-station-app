module.exports = (sequelize, DataTypes) => {
  const Message = sequelize.define('Message', {
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
    userId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'users',
        key: 'id'
      }
    },
    message: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    attachmentUrl: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    messageType: {
      type: DataTypes.ENUM('text', 'image', 'file'),
      defaultValue: 'text'
    },
    isRead: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    }
  }, {
    tableName: 'messages',
    timestamps: true
  });

  Message.associate = function(models) {
    Message.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
    Message.belongsTo(models.User, {
      foreignKey: 'userId',
      as: 'user'
    });
  };

  return Message;
};