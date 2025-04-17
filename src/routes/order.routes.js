import express from 'express';
import orderController from '../controllers/order.controller.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest } from '../middleware/validateRequest.js';
import {
  createOrderSchema,
  updateOrderStatusSchema,
  updatePaymentStatusSchema,
  filterOrdersSchema,
  orderIdSchema
} from '../middleware/order.validator.js';

// Protected routes
const router = express.Router();
router.use(auth);

// Customer order routes
router.post('/', authorize(['customer']), orderController.createOrder);
router.get('/', authorize(['customer']), orderController.getCustomerOrders);
router.get('/:orderId', authorize(['customer']), orderController.getOrderDetails);
router.post('/:orderId/cancel', authorize(['customer']), orderController.cancelOrder);

// Retailer order routes
router.get('/retailer/orders', authorize(['retailer']), orderController.getRetailerOrders);
router.patch('/:orderId/status', authorize(['retailer']), orderController.updateOrderStatus);
router.get('/retailer/analytics', authorize(['retailer']), orderController.getOrderAnalytics);

// Payment status update route (can be used by payment webhook or admin)
router.put('/orders/:orderId/payment', validateRequest(orderIdSchema), validateRequest(updatePaymentStatusSchema), orderController.updatePaymentStatus);

export default router; 