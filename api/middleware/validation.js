const { param, body, validationResult } = require('express-validator');

// handle validation errors
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ 
      success: false, 
      error: 'validation_error',
      details: errors.array() 
    });
  }
  next();
};

// Seat operations validations
const validateSeatHold = [
  param('tripId').isUUID().withMessage('Invalid trip ID'),
  body('seats').isArray({ min: 1 }).withMessage('Seats must be a non-empty array'),
  body('seats.*').isInt({ min: 1 }).withMessage('Invalid seat number'),
  handleValidationErrors
];

const validateSeatPurchase = [
  param('tripId').isUUID().withMessage('Invalid trip ID'),
  body('seats').isArray({ min: 1 }).withMessage('Seats must be a non-empty array'),
  body('seats.*').isInt({ min: 1 }).withMessage('Invalid seat number'),
  body('holdId').isUUID().withMessage('Invalid hold ID'),
  handleValidationErrors
];

const validateSeatRelease = [
  param('tripId').isUUID().withMessage('Invalid trip ID'),
  body('seats').isArray({ min: 1 }).withMessage('Seats must be a non-empty array'),
  body('seats.*').isInt({ min: 1 }).withMessage('Invalid seat number'),
  handleValidationErrors
];

// Trip validations
const validateCreateTrip = [
  body('title').trim().notEmpty().withMessage('Title is required'),
  body('route_from').trim().notEmpty().withMessage('Route from is required'),
  body('route_to').trim().notEmpty().withMessage('Route to is required'),
  body('departure_at').isISO8601().withMessage('Invalid departure date'),
  body('arrival_at').isISO8601().withMessage('Invalid arrival date'),
  body('bus_type').isIn(['standard', 'luxury', 'sleeper']).withMessage('Invalid bus type'),
  body('sale_starts_at').optional().isISO8601().withMessage('Invalid sale start date'),
  body('sale_ends_at').optional().isISO8601().withMessage('Invalid sale end date'),
  body('seats').optional().isArray().withMessage('Seats must be an array'),
  body('seats.*.number').isInt({ min: 1 }).withMessage('Invalid seat number'),
  body('seats.*.price').isFloat({ min: 0 }).withMessage('Invalid seat price'),
  body('seats.*.row').optional().isInt({ min: 1 }).withMessage('Invalid seat row'),
  body('seats.*.column').optional().isString().withMessage('Invalid seat column'),
  handleValidationErrors
];

// Auth validations
const validateSignup = [
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  handleValidationErrors
];

const validateLogin = [
  body('email').isEmail().normalizeEmail().withMessage('Invalid email'),
  body('password').notEmpty().withMessage('Password is required'),
  handleValidationErrors
];

// Booking validations
const validateCancelBooking = [
  param('bookingId').isUUID().withMessage('Invalid booking ID'),
  handleValidationErrors
];




































// Custom validation to check if trip exists and is bookable
const validateTripBookable = async (req, res, next) => {
  try {
    const { Trip } = require('../models');
    const { tripId } = req.params;
    
    const trip = await Trip.findByPk(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, error: 'trip_not_found' });
    }
    
    const now = new Date();
    
    // Check if trip has already departed
    if (trip.departure_at && new Date(trip.departure_at) < now) {
      return res.status(400).json({ success: false, error: 'trip_departed' });
    }
    
    req.trip = trip; 
    next();
  } catch (error) {
    console.error('Trip validation error:', error);
    res.status(500).json({ success: false, error: 'validation_failed' });
  }
};

// Validate seat numbers exist for the trip
const validateSeatNumbers = async (req, res, next) => {
  try {
    const { Seat } = require('../models');
    const { tripId } = req.params;
    const { seats } = req.body;
    
    const existingSeats = await Seat.findAll({
      where: { TripId: tripId },
      attributes: ['number']
    });
    
    const validSeatNumbers = existingSeats.map(s => s.number);
    const invalidSeats = seats.filter(s => !validSeatNumbers.includes(s));
    
    if (invalidSeats.length > 0) {
      return res.status(400).json({ 
        success: false, 
        error: 'invalid_seat_numbers',
        invalidSeats 
      });
    }
    
    next();
  } catch (error) {
    console.error('Seat validation error:', error);
    res.status(500).json({ success: false, error: 'validation_failed' });
  }
};

module.exports = {
  validateSeatHold,
  validateSeatPurchase,
  validateSeatRelease,
  validateCreateTrip,
  validateSignup,
  validateLogin,
  validateCancelBooking,
  validateTripBookable,
  validateSeatNumbers
};