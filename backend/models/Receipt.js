module.exports = (sequelize, DataTypes) => {
  const Receipt = sequelize.define('Receipt', {
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
    receiptNumber: {
      type: DataTypes.STRING(100),
      allowNull: false,
      unique: true
    },
    items: {
      type: DataTypes.JSON,
      allowNull: false
    },
    subtotal: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    tax: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    total: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    issuedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  }, {
    tableName: 'receipts',
    timestamps: true
  });

  Receipt.associate = function(models) {
    Receipt.belongsTo(models.Booking, {
      foreignKey: 'bookingId',
      as: 'booking'
    });
  };

  return Receipt;
};