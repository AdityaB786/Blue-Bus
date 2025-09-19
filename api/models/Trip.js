const { DataTypes } = require('sequelize');

module.exports = (sequelize) =>
  sequelize.define('Trip', {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true
    },
    title: { type: DataTypes.STRING, allowNull: false },
    route_from: { type: DataTypes.STRING, allowNull: false },
    route_to: { type: DataTypes.STRING, allowNull: false },
    departure_at: { type: DataTypes.DATE, allowNull: false },
    arrival_at: { type: DataTypes.DATE, allowNull: false },
    bus_type: { type: DataTypes.STRING, allowNull: false },
  });
