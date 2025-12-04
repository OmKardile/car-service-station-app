const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const ServiceController = require('../controllers/serviceController');
const { authenticate, authorize } = require('../middleware/auth');
const { validate } = require('../middleware/validation');

// Public routes
router.get('/', ServiceController.getAllServices);
router.get('/:id', ServiceController.getServiceById);
router.get('/station/:stationId', ServiceController.getServicesByStation);

// Admin routes
const createServiceValidation = [
  body('name').notEmpty().withMessage('Service name is required'),
  body('description').optional().isString(),
  body('basePrice').isDecimal().withMessage('Valid price is required'),
  body('estimatedDuration').isInt({ min: 1 }).withMessage('Valid duration is required'),
];

router.post(
  '/',
  authenticate,
  authorize('admin', 'superadmin'),
  validate(createServiceValidation),
  ServiceController.createService
);

router.put(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  ServiceController.updateService
);

router.delete(
  '/:id',
  authenticate,
  authorize('admin', 'superadmin'),
  ServiceController.deleteService
);

module.exports = router;