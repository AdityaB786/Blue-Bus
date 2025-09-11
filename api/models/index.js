require('dotenv').config();
const { Sequelize } = require('sequelize');

const TripModel = require('./Trip');
const SeatModel = require('./Seat');
const UserModel = require('./User');
const BookingModel = require('./Booking');

const sequelize = new Sequelize(process.env.DATABASE_URL, {
  dialect: 'postgres',
  logging: false,
});

// Instantiate models
const Trip = TripModel(sequelize);
const Seat = SeatModel(sequelize);
const User = UserModel(sequelize);
const Booking = BookingModel(sequelize);

// Associations
Trip.hasMany(Seat, { as: 'seats', foreignKey: 'TripId' });
Seat.belongsTo(Trip, { foreignKey: 'TripId' });

Trip.hasMany(Booking, { foreignKey: 'TripId' });
Booking.belongsTo(Trip, { foreignKey: 'TripId' });

User.hasMany(Booking, { foreignKey: 'UserId' });
Booking.belongsTo(User, { foreignKey: 'UserId' });

// Connect
const syncDB = async () => {
  try {
    await sequelize.authenticate();
    await sequelize.sync({ force: false });
    console.log('✅ Sequelize: DB connected & tables ready');
  } catch (err) {
    console.error('Sequelize connection error', err);
  }
};

module.exports = { sequelize, Trip, Seat, User, Booking, syncDB };
