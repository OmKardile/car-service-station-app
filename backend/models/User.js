module.exports = (sequelize, DataTypes) => {
  const User = sequelize.define('User', {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true
    },
    email: {
      type: DataTypes.STRING(255),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true
      }
    },
    password: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    firstName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    lastName: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    phone: {
      type: DataTypes.STRING(20),
      allowNull: true
    },
    role: {
      type: DataTypes.ENUM('client', 'admin', 'superadmin'),
      defaultValue: 'client'
    },
    isActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    },
    refreshToken: {
      type: DataTypes.TEXT,
      allowNull: true
    }
  }, {
    tableName: 'users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] }
    },
    scopes: {
      withSensitive: {
        attributes: { include: ['password', 'refreshToken'] }
      }
    }
  });

  User.associate = function(models) {
    User.hasMany(models.Booking, {
      foreignKey: 'userId',
      as: 'bookings'
    });
    User.hasMany(models.Message, {
      foreignKey: 'userId',
      as: 'messages'
    });
    User.hasMany(models.BookingStatusHistory, {
      foreignKey: 'changedBy',
      as: 'statusChanges'
    });
  };

  return User;
};