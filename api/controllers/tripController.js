const { Trip, Seat } = require("../models");
const redis = require("../redis");

// Create a trip with seats
exports.createTrip = async (req, res) => {
  try {
    const {
      title,
      route_from,
      route_to,
      departure_at,
      arrival_at,
      bus_type,
      sale_starts_at,
      sale_ends_at,
      seats,
    } = req.body;

    const trip = await Trip.create({
      title,
      route_from,
      route_to,
      departure_at,
      arrival_at,
      bus_type,
      sale_starts_at,
      sale_ends_at,
    });

    if (Array.isArray(seats) && seats.length) {
      const seatPromises = seats.map((s) =>
        Seat.create({ TripId: trip.id, ...s })
      );
      await Promise.all(seatPromises);
    }

    const tripWithSeats = await Trip.findByPk(trip.id, {
      include: { model: Seat, as: "seats" },
    });

    res.json({ success: true, trip: tripWithSeats });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "failed_to_create_trip" });
  }
};

// Get all trips
exports.getTrips = async (req, res) => {
  try {
    // include alias 'seats'
    const trips = await Trip.findAll({ include: { model: Seat, as: "seats" } });

    const tripsWithSeatStatus = await Promise.all(
      trips.map(async (trip) => {
        let available = 0,
          held = 0,
          sold = 0;

        for (const seat of trip.seats) {
          const key = `trip:${trip.id}:seat:${seat.number}`;
          const holdData = await redis.get(key);

          if (holdData) held++;
          else if (seat.status === "sold") sold++;
          else available++;
        }

        return {
          ...trip.toJSON(),
          seatCounts: { available, held, sold },
        };
      })
    );

    res.json({ success: true, trips: tripsWithSeatStatus });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "failed_to_get_trips" });
  }
};

// Get a single trip with full seats and live status
exports.getTripById = async (req, res) => {
  try {
    const { id } = req.params;

    const trip = await Trip.findByPk(id, {
      include: { model: Seat, as: "seats" },
    });

    if (!trip)
      return res.status(404).json({ success: false, error: "trip_not_found" });

    const seatsWithStatus = await Promise.all(
      trip.seats.map(async (seat) => {
        const key = `trip:${id}:seat:${seat.number}`;
        const holdData = await redis.get(key);

        if (holdData) seat.status = "held";
        return seat;
      })
    );

    let totalAvailablePrice = 0;
    seatsWithStatus.forEach((seat) => {
      if (seat.status === "available") totalAvailablePrice += seat.price;
    });

    res.json({
      success: true,
      trip: { ...trip.toJSON(), seats: seatsWithStatus },
      totalAvailablePrice,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: "failed_to_get_trip" });
  }
};

// // Delete a trip
// exports.deleteTrip = async (req, res) => {
//  if (req.user.role !== 'admin') {
//   return res.status(403).json({ success: false, error: 'not_authorized' });
// }
//   const t = await sequelize.transaction();
//   try {
//     const { id } = req.params;

//     // 1. Find the trip
//     const trip = await Trip.findByPk(id, { include: { model: Seat, as: 'seats' }, transaction: t });
//     if (!trip) {
//       await t.rollback();
//       return res.status(404).json({ success: false, error: 'trip_not_found' });
//     }

//     // 2. Remove any Redis holds for seats
//     for (const seat of trip.seats) {
//       const key = `trip:${id}:seat:${seat.number}`;
//       await redis.del(key);
//     }

//     // 3. Delete seats first (optional if cascade is set)
//     await Seat.destroy({ where: { TripId: id }, transaction: t });

//     // 4. Delete the trip
//     await trip.destroy({ transaction: t });

//     // 5. Commit transaction
//     await t.commit();

//     // 6. Broadcast deletion (optional)
//     broadcast({ type: 'trip_deleted', tripId: id });

//     res.json({ success: true, message: 'trip_deleted', tripId: id });
//   } catch (err) {
//     console.error('deleteTrip error:', err);
//     await t.rollback();
//     res.status(500).json({ success: false, error: 'failed_to_delete_trip' });
//   }
// };
