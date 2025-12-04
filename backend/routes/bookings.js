const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const BookingController = require('../controllers/bookingController');
const { authenticate } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Validation rules
const createBookingValidation = [
  body('serviceId').isInt().withMessage('Valid service ID is required'),
  body('stationId').isInt().withMessage('Valid station ID is required'),
  body('scheduledDate').isISO8601().withMessage('Valid date is required'),
  body('vehicleDetails').isObject().withMessage('Vehicle details are required'),
  body('vehicleDetails.make').notEmpty().withMessage('Vehicle make is required'),
  body('vehicleDetails.model').notEmpty().withMessage('Vehicle model is required'),
  body('vehicleDetails.year').isInt({ min: 1900, max: new Date().getFullYear() + 1 }).withMessage('Valid year is required'),
  body('vehicleDetails.licensePlate').notEmpty().withMessage('License plate is required'),
  body('specialInstructions').optional().isString(),
];

// Protected routes
router.get(
  '/',
  authenticate,
  BookingController.getUserBookings
);

router.get(
  '/available-slots',
  authenticate,
  BookingController.getAvailableTimeSlots
);

router.get(
  '/:id',
  authenticate,
  BookingController.getBookingById
);

router.post(
  '/',
  authenticate,
  validate(createBookingValidation),
  BookingController.createBooking
);

router.patch(
  '/:id/status',
  authenticate,
  [
    body('status').isIn(['pending', 'confirmed', 'in_progress', 'completed', 'cancelled']),
    body('notes').optional().isString()
  ],
  BookingController.updateBookingStatus
);

router.post(
  '/:id/cancel',
  authenticate,
  [body('reason').optional().isString()],
  BookingController.cancelBooking
);

module.exports = router;