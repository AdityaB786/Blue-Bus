const express = require('express');
const router = express.Router();
const tripCtrl = require('../controllers/tripController');
const auth = require('../middleware/auth');
const isAdmin = require('../middleware/isAdmin');
const { validateCreateTrip } = require('../middleware/validation');

// Admin: create a new trip
router.post('/', auth, isAdmin, validateCreateTrip, tripCtrl.createTrip);

// Public: view trips
router.get('/', tripCtrl.getTrips);
router.get('/:id', tripCtrl.getTripById);

module.exports = router;
