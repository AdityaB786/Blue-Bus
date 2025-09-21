const express = require('express');
const router = express.Router();
const bookingCtrl = require('../controllers/bookingController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');

// User: get my own bookings
router.get('/my', auth, bookingCtrl.getMyBookings);

// Admin: get all bookings
router.get('/', auth, isAdmin, bookingCtrl.getBookings);

// Cancel booking (user can cancel their own)
router.delete('/:bookingId', auth, bookingCtrl.cancelBooking);

module.exports = router;
