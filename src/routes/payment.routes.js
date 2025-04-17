const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const authorize = require('../middleware/authorize');
const {
  createPaymentOrder,
  verifyPayment,
  processRefund,
  getPaymentDetails,
  handleWebhook
} = require('../controllers/payment.controller');

/**
 * @swagger
 * /api/payments/orders/{orderId}/create:
 *   post:
 *     summary: Create a payment order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the order to create payment for
 *     responses:
 *       200:
 *         description: Payment order created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 orderId:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *       400:
 *         description: Invalid order or payment already processed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/create', auth, authorize('customer'), createPaymentOrder);

/**
 * @swagger
 * /api/payments/verify:
 *   post:
 *     summary: Verify a payment
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - razorpay_order_id
 *               - razorpay_payment_id
 *               - razorpay_signature
 *             properties:
 *               razorpay_order_id:
 *                 type: string
 *               razorpay_payment_id:
 *                 type: string
 *               razorpay_signature:
 *                 type: string
 *     responses:
 *       200:
 *         description: Payment verified successfully
 *       400:
 *         description: Invalid payment signature
 *       401:
 *         description: Unauthorized
 */
router.post('/verify', auth, authorize('customer'), verifyPayment);

/**
 * @swagger
 * /api/payments/orders/{orderId}/refund:
 *   post:
 *     summary: Process a refund for an order
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: orderId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *         description: ID of the order to refund
 *     responses:
 *       200:
 *         description: Refund processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 refundId:
 *                   type: string
 *       400:
 *         description: Invalid order or payment not processed
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Order not found
 */
router.post('/orders/:orderId/refund', auth, authorize('customer'), processRefund);

/**
 * @swagger
 * /api/payments/webhook:
 *   post:
 *     summary: Handle Razorpay webhooks
 *     tags: [Payments]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Webhook processed successfully
 *       400:
 *         description: Invalid webhook signature
 */
router.post('/webhook', handleWebhook);

/**
 * @swagger
 * /api/payments/{paymentId}:
 *   get:
 *     summary: Get payment details
 *     tags: [Payments]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: paymentId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID of the payment to retrieve
 *     responses:
 *       200:
 *         description: Payment details retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                 amount:
 *                   type: number
 *                 currency:
 *                   type: string
 *                 status:
 *                   type: string
 *                 method:
 *                   type: string
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Payment not found
 */
router.get('/:paymentId', auth, getPaymentDetails);

module.exports = router; 