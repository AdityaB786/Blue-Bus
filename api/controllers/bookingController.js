const { Booking, Seat, sequelize } = require('../models');
const { broadcast } = require('../models/wsServer');
const redis = require('../redis');
const sendEmail = require('../utils/sendEmail');
exports.createBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { TripId, seats } = req.body;
    const user = req.user;

    // 1️⃣ Create booking
    const booking = await Booking.create(
      {
        UserId: user.id,
        TripId,
        seats,
        total_amount: seats.length * 500 // example price
      },
      { transaction: t }
    );

    // 2️⃣ Mark seats as booked
    await Seat.update(
      { status: 'booked' },
      { where: { TripId, number: seats }, transaction: t }
    );

    // 3️⃣ Optionally set Redis holds
    for (const seatNumber of seats) {
      const key = `trip:${TripId}:seat:${seatNumber}`;
      await redis.set(key, 'booked');
    }

    await t.commit();

    // 4️⃣ Broadcast to other users
    broadcast({ type: 'seat_booked', tripId: TripId, seats });

    // 5️⃣ Send confirmation email
    const emailText = `Your booking for trip ${TripId} is confirmed. Seats: ${seats.join(', ')}. Total amount: ₹${booking.total_amount}.`;
    const emailHtml = `
      <h2>Booking Confirmed!</h2>
      <p>Trip ID: <strong>${TripId}</strong></p>
      <p>Seats booked: ${seats.join(', ')}</p>
      <p>Total amount: <strong>₹${booking.total_amount}</strong></p>
      <p>Thank you for choosing BlueBus!</p>
    `;

    sendEmail(user.email, 'Booking Confirmed - BlueBus', emailText, emailHtml);

    res.json({ success: true, booking });
  } catch (err) {
    console.error('createBooking error:', err);
    await t.rollback();
    res.status(500).json({ success: false, error: 'booking_failed' });
  }
};
// Admin: get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('getBookings error:', err);
    res.status(500).json({ success: false, error: 'failed_to_get_bookings' });
  }
};

// User: get my bookings
exports.getMyBookings = async (req, res) => {
  try {
    const userId = req.user.id;
    const bookings = await Booking.findAll({ where: { UserId: userId } });

    res.json({ success: true, bookings });
  } catch (err) {
    console.error('getMyBookings error:', err);
    res.status(500).json({ success: false, error: 'failed_to_get_my_bookings' });
  }
};

// Cancel booking
exports.cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookingId } = req.params;
    const user = req.user;

    // Fetch booking
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'booking_not_found' });
    }

    // Check permissions: user can cancel own, admin can cancel any
    if (user.role !== 'admin' && booking.UserId !== user.id) {
      await t.rollback();
      return res.status(403).json({ success: false, error: 'not_allowed_to_cancel' });
    }

    // Free seats in DB
    const seats = booking.seats || [];
    await Seat.update(
      { status: 'available' },
      { where: { TripId: booking.TripId, number: seats }, transaction: t }
    );

    // Remove any Redis holds just in case
    for (const seatNumber of seats) {
      const key = `trip:${booking.TripId}:seat:${seatNumber}`;
      await redis.del(key);
    }

    // Capture total price before deleting
    const totalAmount = booking.total_amount || 0;

    // Delete booking
    await booking.destroy({ transaction: t });

    // Commit
    await t.commit();

    // Broadcast seat release
    broadcast({ type: 'seat_released', tripId: booking.TripId, seats });

    // Return response including total price/refund
    res.json({
      success: true,
      message: 'booking_cancelled',
      seatsReleased: seats,
      totalAmountRefunded: totalAmount
    });
  } catch (err) {
    console.error('cancelBooking error:', err);
    await t.rollback();
    res.status(500).json({ success: false, error: 'cancel_failed' });
  }
};
