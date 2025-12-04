const { validationResult } = require('express-validator');

const validate = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(validation => validation.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }

    res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array()
    });
  };
};

const validationRules = {
  register: [
    require('express-validator').body('email').isEmail().normalizeEmail(),
    require('express-validator').body('password').isLength({ min: 6 }),
    require('express-validator').body('firstName').notEmpty().trim(),
    require('express-validator').body('lastName').notEmpty().trim(),
    require('express-validator').body('phone').optional().isLength({ min: 10 }),
  ],
  
  login: [
    require('express-validator').body('email').isEmail().normalizeEmail(),
    require('express-validator').body('password').notEmpty(),
  ],
  
  updateProfile: [
    require('express-validator').body('firstName').optional().notEmpty().trim(),
    require('express-validator').body('lastName').optional().notEmpty().trim(),
    require('express-validator').body('phone').optional().isLength({ min: 10 }),
  ],
  
  createBooking: [
    require('express-validator').body('serviceId').isInt(),
    require('express-validator').body('stationId').isInt(),
    require('express-validator').body('scheduledDate').isISO8601(),
    require('express-validator').body('vehicleDetails').isObject(),
    require('express-validator').body('totalPrice').isDecimal(),
    require('express-validator').body('specialInstructions').optional().isString(),
  ]
};

module.exports = {
  validate,
  validationRules
};