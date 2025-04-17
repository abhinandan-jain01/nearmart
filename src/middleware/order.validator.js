import Joi from 'joi';
import { logger } from '../utils/logger.js';

const createOrderSchema = Joi.object({
  items: Joi.array().items(
    Joi.object({
      productId: Joi.string().required(),
      quantity: Joi.number().min(1).required()
    })
  ).min(1).required(),
  shippingAddress: Joi.string().required(),
  paymentMethod: Joi.string().valid('credit_card', 'paypal').required()
});

const updateOrderStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').required()
});

const updatePaymentStatusSchema = Joi.object({
  paymentStatus: Joi.string().valid('pending', 'paid', 'failed', 'refunded').required(),
  paymentId: Joi.string().optional()
});

const filterOrdersSchema = Joi.object({
  status: Joi.string().valid('pending', 'processing', 'shipped', 'delivered', 'cancelled').optional(),
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional()
});

const orderIdSchema = Joi.object({
  orderId: Joi.string().required()
});

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

export {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  filterOrdersSchema,
  orderIdSchema,
  validateRequest
}; 