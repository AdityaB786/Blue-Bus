require('dotenv').config();
const { Trip, Seat, syncDB } = require('./models');

(async () => {
  try {
    await syncDB();

    const trip = await Trip.create({
      title: 'Kanpur to Lucknow',
      route_from: 'Kanpur',
      route_to: 'Lucknow',
      departure_at: new Date('2025-09-12T08:00:00Z'),
      arrival_at: new Date('2025-09-12T11:00:00Z'),
      bus_type: 'AC Sleeper',
      sale_starts_at: new Date('2025-09-10T10:00:00Z'),
      sale_ends_at: new Date('2025-09-12T07:00:00Z')
    });

    await Seat.bulkCreate([
      { row: 'A', number: '1', position: 'window', price: 500, TripId: trip.id },
      { row: 'A', number: '2', position: 'aisle', price: 500, TripId: trip.id }
    ]);

    console.log('Seed done.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
