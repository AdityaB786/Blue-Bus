const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Seat', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    row: { type: DataTypes.INTEGER },
    number: { type: DataTypes.INTEGER, allowNull: false },
    column: { type: DataTypes.STRING },
    price: { type: DataTypes.FLOAT, allowNull: false },
    status: { type: DataTypes.STRING, defaultValue: 'available' }, 
    TripId: { type: DataTypes.UUID, allowNull: false } 
  });
