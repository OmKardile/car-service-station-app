const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const StationController = require('../controllers/stationController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes
router.get('/', StationController.getAllStations);
router.get('/:id', StationController.getStationById);
router.get('/:stationId/service/:serviceId/price', StationController.getStationServicePrice);

// Admin routes
const createStationValidation = [
  body('name').notEmpty().withMessage('Station name is required'),
  body('address').notEmpty().withMessage('Station address is required'),
  body('phone').optional().isLength({ min: 10 }),
  body('email').optional().isEmail(),
  body('operatingHours').optional().isString(),
];

router.post(
  '/',
  authenticate,
  authorize('admin', 'superadmin'),
  validate(createStationValidation),
  StationController.createStation
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  StationController.updateStation
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  StationController.deleteStation
);

router.put(
  '/:stationId/service/:serviceId/price',
  authenticate,
  authorize('admin', 'superadmin'),
  [body('price').isDecimal().withMessage('Valid price is required')],
  StationController.updateStationServicePrice
);

module.exports = router;