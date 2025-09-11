const { Booking, Seat, sequelize } = require('../models');
const { broadcast } = require('../models/wsServer');
const redis = require('../redis');

// ✅ Admin: get all bookings
exports.getBookings = async (req, res) => {
  try {
    const bookings = await Booking.findAll();
    res.json({ success: true, bookings });
  } catch (err) {
    console.error('getBookings error:', err);
    res.status(500).json({ success: false, error: 'failed_to_get_bookings' });
  }
};

// ✅ User: get my bookings
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

// ❌ Cancel booking
exports.cancelBooking = async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { bookingId } = req.params;
    const user = req.user;

    // 1️⃣ Fetch booking
    const booking = await Booking.findByPk(bookingId, { transaction: t });
    if (!booking) {
      await t.rollback();
      return res.status(404).json({ success: false, error: 'booking_not_found' });
    }

    // 2️⃣ Check permissions: user can cancel own, admin can cancel any
    if (user.role !== 'admin' && booking.UserId !== user.id) {
      await t.rollback();
      return res.status(403).json({ success: false, error: 'not_allowed_to_cancel' });
    }

    // 3️⃣ Free seats in DB
    const seats = booking.seats || [];
    await Seat.update(
      { status: 'available' },
      { where: { TripId: booking.TripId, number: seats }, transaction: t }
    );

    // 4️⃣ Remove any Redis holds just in case
    for (const seatNumber of seats) {
      const key = `trip:${booking.TripId}:seat:${seatNumber}`;
      await redis.del(key);
    }

    // 5️⃣ Capture total price before deleting
    const totalAmount = booking.total_amount || 0;

    // 6️⃣ Delete booking
    await booking.destroy({ transaction: t });

    // 7️⃣ Commit
    await t.commit();

    // 8️⃣ Broadcast seat release
    broadcast({ type: 'seat_released', tripId: booking.TripId, seats });

    // 9️⃣ Return response including total price/refund
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
