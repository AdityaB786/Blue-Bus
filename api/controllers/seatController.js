const { Seat, Booking, sequelize } = require('../models');
const redis = require('../redis');
const { broadcast } = require('../models/wsServer');

const HOLD_TTL = 120; 

// --- Hold Seats ---
exports.holdSeats = async (req, res) => {
  try {
    const { v4: uuidv4 } = await import('uuid');
    const { tripId } = req.params;
    const { seats } = req.body;
    const userId = req.user.id;

    // Get all seats with lock to prevent race conditions
    const dbSeats = await Seat.findAll({ 
      where: { TripId: tripId, number: seats },
      lock: true
    });

    // Validate all requested seats exist
    if (dbSeats.length !== seats.length) {
      const foundNumbers = dbSeats.map(s => s.number);
      const notFound = seats.filter(n => !foundNumbers.includes(n));
      return res.status(404).json({
        success: false,
        error: 'seats_not_found',
        notFound
      });
    }

    // Check DB availability
    const unavailableSeats = dbSeats.filter(s => s.status !== 'available').map(s => s.number);
    if (unavailableSeats.length > 0) {
      return res.status(409).json({
        success: false,
        error: 'some_seats_unavailable',
        seats: unavailableSeats
      });
    }

    const holdId = uuidv4();
    let totalPrice = 0;
    const heldSeats = [];
    const failedSeats = [];

    // Use Redis pipeline for atomic operations
    const pipeline = redis.pipeline();
    
    for (const seat of dbSeats) {
      const key = `trip:${tripId}:seat:${seat.number}`;
      // Use SET NX (set if not exists) for atomic operation
      pipeline.set(
        key, 
        JSON.stringify({ userId, holdId, price: seat.price }), 
        'NX', 
        'EX', 
        HOLD_TTL
      );
    }

    const results = await pipeline.exec();
    
    // Check which seats were successfully held
    for (let i = 0; i < results.length; i++) {
      const [err, result] = results[i];
      const seat = dbSeats[i];
      
      if (err || result !== 'OK') {
        failedSeats.push(seat.number);
      } else {
        heldSeats.push(seat.number);
        totalPrice += seat.price;
      }
    }

    // If any seats failed, release all holds and return error
    if (failedSeats.length > 0) {
      // Rollback successful holds
      if (heldSeats.length > 0) {
        const rollbackPipeline = redis.pipeline();
        for (const seatNumber of heldSeats) {
          rollbackPipeline.del(`trip:${tripId}:seat:${seatNumber}`);
        }
        await rollbackPipeline.exec();
      }
      
      return res.status(409).json({
        success: false,
        error: 'some_seats_already_held',
        failedSeats
      });
    }

    broadcast({ type: 'seat_held', tripId, seats: heldSeats, holdId });
    res.json({ 
      success: true, 
      holdId, 
      totalPrice, 
      ttl: HOLD_TTL,
      seats: heldSeats 
    });
  } catch (err) {
    console.error('holdSeats error:', err);
    res.status(500).json({ success: false, error: 'hold_failed' });
  }
};

// --- Release Seats ---
exports.releaseSeats = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { seats } = req.body;

    if (!Array.isArray(seats) || seats.length === 0)
      return res.status(400).json({ success: false, error: 'no_seats_selected' });

    for (const seatNumber of seats) {
      const key = `trip:${tripId}:seat:${seatNumber}`;
      try { await redis.del(key); } catch {}
    }

    broadcast({ type: 'seat_released', tripId, seats });
    res.json({ success: true, released: seats });
  } catch (err) {
    console.error('releaseSeats error:', err);
    res.status(500).json({ success: false, error: 'release_failed' });
  }
};

// --- Purchase Seats ---
exports.purchaseSeats = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { tripId } = req.params;
    const { seats, holdId } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(seats) || seats.length === 0)
      return res.status(400).json({ success: false, error: 'no_seats_selected' });

    // Validate Redis holds
    for (const seatNumber of seats) {
      const key = `trip:${tripId}:seat:${seatNumber}`;
      const holdData = await redis.get(key);
      if (!holdData) {
        await t.rollback();
        return res.status(400).json({ success: false, error: `Seat ${seatNumber} not held` });
      }
      const parsed = JSON.parse(holdData);
      if (parsed.userId !== userId || parsed.holdId !== holdId) {
        await t.rollback();
        return res.status(403).json({ success: false, error: `Seat ${seatNumber} not held by you` });
      }
    }

    // Lock seats in DB and calculate total price
    const dbSeats = await Seat.findAll({
      where: { TripId: tripId, number: seats },
      lock: t.LOCK.UPDATE,
      transaction: t,
    });

    let totalPrice = 0;
    for (const seat of dbSeats) {
      if (seat.status === 'sold') {
        await t.rollback();
        return res.status(409).json({ success: false, error: `Seat ${seat.number} already sold` });
      }
      totalPrice += seat.price;
    }

    // Mark as sold
    await Seat.update(
      { status: 'sold' },
      { where: { TripId: tripId, number: seats }, transaction: t }
    );

    // Create booking
    const booking = await Booking.create(
      { UserId: userId, TripId: tripId, seats, status: 'confirmed', total_amount: totalPrice },
      { transaction: t }
    );

    await t.commit();

    // Remove Redis holds
    for (const seatNumber of seats) {
      const key = `trip:${tripId}:seat:${seatNumber}`;
      await redis.del(key);
    }

    broadcast({ type: 'seat_sold', tripId, seats, bookingId: booking.id, userId });
    res.json({ success: true, booking, totalPrice });
  } catch (err) {
    console.error('purchaseSeats error:', err);
    await t.rollback();
    res.status(500).json({ success: false, error: 'purchase_failed' });
  }
};

// --- Get Seat Status ---
exports.getSeatStatus = async (req, res) => {
  try {
    const { tripId } = req.params;
    const seats = await Seat.findAll({ where: { TripId: tripId } });
    if (!seats || seats.length === 0)
      return res.status(404).json({ success: false, error: 'no_seats_found' });

    const seatStatuses = [];
    for (const seat of seats) {
      const key = `trip:${tripId}:seat:${seat.number}`;
      const holdData = await redis.get(key);

      if (holdData) {
        const ttl = await redis.ttl(key);
        seatStatuses.push({ number: seat.number, status: 'held', price: seat.price, ttl: ttl > 0 ? ttl : null });
      } else if (seat.status === 'sold') {
        seatStatuses.push({ number: seat.number, status: 'sold', price: seat.price });
      } else {
        seatStatuses.push({ number: seat.number, status: 'available', price: seat.price });
      }
    }

    res.json({ success: true, tripId, seats: seatStatuses });
  } catch (err) {
    console.error('getSeatStatus error:', err);
    res.status(500).json({ success: false, error: 'get_seat_status_failed' });
  }
};

// --- Cancel Seats (used by bookingController cancel) ---
exports.cancelSeats = async (tripId, seats) => {
  try {
    await Seat.update({ status: 'available' }, { where: { TripId: tripId, number: seats } });

    for (const seatNumber of seats) {
      const key = `trip:${tripId}:seat:${seatNumber}`;
      try { await redis.del(key); } catch {}
    }

    broadcast({ type: 'seat_released', tripId, seats });
  } catch (err) {
    console.error('cancelSeats error:', err);
  }
};
