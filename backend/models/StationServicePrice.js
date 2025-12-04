module.exports = (sequelize, DataTypes) => {
  const StationServicePrice = sequelize.define('StationServicePrice', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    stationId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'stations',
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
    price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    tableName: 'station_service_prices',
    timestamps: true,
    indexes: [
      {
        unique: true,
        fields: ['stationId', 'serviceId']
      }
    ]
  });

  StationServicePrice.associate = function(models) {
    StationServicePrice.belongsTo(models.Station, {
      foreignKey: 'stationId',
      as: 'station'
    });
    StationServicePrice.belongsTo(models.Service, {
      foreignKey: 'serviceId',
      as: 'service'
    });
  };

  return StationServicePrice;
};