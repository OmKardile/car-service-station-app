const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const AdminController = require('../controllers/adminController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// All routes require admin or superadmin access
router.use(authenticate);
router.use(authorize('admin', 'superadmin'));

// User management
router.get('/users', AdminController.getAllUsers);
router.get('/users/:id', AdminController.getUserById);
router.patch('/users/:id', AdminController.updateUser);

// Booking management
router.get('/bookings', AdminController.getAllBookings);
router.get('/bookings/analytics', AdminController.getBookingAnalytics);

// Service price management
router.post(
  '/station-service-prices',
  validate([
    body('stationId').isInt(),
    body('serviceId').isInt(),
    body('price').isDecimal()
  ]),
  AdminController.createStationServicePrice
);

router.put(
  '/station-service-prices/:stationId/:serviceId',
  AdminController.updateStationServicePrice
);

// System statistics
router.get('/statistics', AdminController.getSystemStatistics);

module.exports = router;