import Joi from 'joi';
import { logger } from '../utils/logger.js';

const validateRequest = (schema) => {
  return (req, res, next) => {
    const { error } = schema.validate(req.body);
    if (error) {
      logger.error('Validation error:', error.details);
      return res.status(400).json({ message: error.details[0].message });
    }
    next();
  };
};

// Common validation schemas
const schemas = {
  product: Joi.object({
    name: Joi.string().required().min(3).max(100),
    description: Joi.string().required().min(10).max(1000),
    price: Joi.number().required().min(0),
    stock: Joi.number().required().min(0),
    category: Joi.string().required().valid('Electronics', 'Clothing', 'Books', 'Other'),
    image: Joi.string().required().uri()
  }),

  order: Joi.object({
    items: Joi.array().items(
      Joi.object({
        productId: Joi.string().required().uuid(),
        quantity: Joi.number().required().min(1)
      })
    ).required().min(1),
    shippingAddress: Joi.object({
      street: Joi.string().required().min(3).max(100),
      street2: Joi.string().max(100),
      city: Joi.string().required().min(2).max(50),
      state: Joi.string().required().min(2).max(50),
      country: Joi.string().required().min(2).max(50),
      zipCode: Joi.string().required().pattern(/^[0-9]{5}(?:-[0-9]{4})?$/),
      location: Joi.object({
        type: Joi.string().valid('Point').default('Point'),
        coordinates: Joi.array().items(Joi.number()).length(2).required()
      }).required(),
      label: Joi.string().valid('Home', 'Work', 'Other').default('Home')
    }).required(),
    paymentMethod: Joi.string().required().valid('credit_card', 'paypal', 'bank_transfer')
  }),

  address: Joi.object({
    street: Joi.string().required().min(3).max(100),
    street2: Joi.string().max(100),
    city: Joi.string().required().min(2).max(50),
    state: Joi.string().required().min(2).max(50),
    country: Joi.string().required().min(2).max(50),
    zipCode: Joi.string().required().pattern(/^[0-9]{5}(?:-[0-9]{4})?$/),
    location: Joi.object({
      type: Joi.string().valid('Point').default('Point'),
      coordinates: Joi.array().items(Joi.number()).length(2).required()
    }).required(),
    isDefault: Joi.boolean().default(false),
    label: Joi.string().valid('Home', 'Work', 'Other').default('Home')
  })
};

export { validateRequest, schemas }; 