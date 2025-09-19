const { DataTypes } = require('sequelize');

module.exports = (sequelize) => {
  return sequelize.define('Booking', {
    id: { 
      type: DataTypes.UUID, 
      primaryKey: true 
    },
    UserId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    TripId: { 
      type: DataTypes.UUID, 
      allowNull: false,
      references: {
        model: 'Trips',
        key: 'id'
      }
    },
    seats: {
      type: DataTypes.JSON,
      allowNull: false,
      validate: {
        isArray(value) {
          if (!Array.isArray(value)) {
            throw new Error('Seats must be an array');
          }
          if (value.length === 0) {
            throw new Error('At least one seat must be selected');
          }
        }
      }
    },
    total_amount: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0
      }
    },
    status: {
      type: DataTypes.ENUM('confirmed', 'cancelled'),
      defaultValue: 'confirmed',
      allowNull: false
    }
  }, {
    tableName: 'Bookings',
    timestamps: true
  });
};
