const express = require('express');
const router = express.Router();
const seatController = require('../controllers/seatController');
const auth = require('../middleware/auth');
const {
  validateSeatHold,
  validateSeatPurchase,
  validateSeatRelease,
  validateTripBookable,
  validateSeatNumbers
} = require('../middleware/validation');

// 👤 User must be logged in to hold/purchase/release seats
router.post(
  '/:tripId/hold', 
  auth, 
  validateSeatHold,
  validateTripBookable,
  validateSeatNumbers,
  seatController.holdSeats
);

router.post(
  '/:tripId/purchase', 
  auth, 
  validateSeatPurchase,
  validateTripBookable,
  seatController.purchaseSeats
);

router.post(
  '/:tripId/release', 
  auth, 
  validateSeatRelease,
  seatController.releaseSeats
);

// 🌍 Public: view current seat status for a trip
router.get('/:tripId/status', seatController.getSeatStatus);

module.exports = router;
