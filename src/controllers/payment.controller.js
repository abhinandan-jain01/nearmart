const paymentService = require('../services/payment.service');
const orderService = require('../services/order.service');
const { logger } = require('../utils/logger');
const crypto = require('crypto');

// Create a payment order
const createPaymentOrder = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderService.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.customerId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access to order' });
        }

        if (order.paymentStatus !== 'pending') {
            return res.status(400).json({ error: 'Order payment has already been processed' });
        }

        const razorpayOrder = await paymentService.createOrder(order.totalAmount);
        
        // Update order with Razorpay order ID
        await orderService.updateOrder(orderId, {
            paymentId: razorpayOrder.id
        });

        res.json({
            orderId: razorpayOrder.id,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency
        });
    } catch (error) {
        logger.error('Error creating payment order:', error);
        res.status(500).json({ error: 'Failed to create payment order' });
    }
};

// Verify payment
const verifyPayment = async (req, res) => {
    try {
        const {
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        } = req.body;

        const isValid = await paymentService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );

        if (!isValid) {
            return res.status(400).json({ error: 'Invalid payment signature' });
        }

        // Get order details from Razorpay
        const paymentDetails = await paymentService.getPaymentDetails(razorpay_payment_id);
        const orderId = paymentDetails.notes.orderId;

        // Update order payment status
        await orderService.updatePaymentStatus(orderId, 'paid');

        res.json({ message: 'Payment verified successfully' });
    } catch (error) {
        logger.error('Error verifying payment:', error);
        res.status(500).json({ error: 'Failed to verify payment' });
    }
};

// Process refund
const processRefund = async (req, res) => {
    try {
        const { orderId } = req.params;
        const order = await orderService.getOrderById(orderId);

        if (!order) {
            return res.status(404).json({ error: 'Order not found' });
        }

        if (order.customerId !== req.user.id) {
            return res.status(403).json({ error: 'Unauthorized access to order' });
        }

        if (order.paymentStatus !== 'paid') {
            return res.status(400).json({ error: 'Order payment has not been processed or already refunded' });
        }

        const refund = await paymentService.refundPayment(order.paymentId, order.totalAmount);
        
        // Update order payment status
        await orderService.updatePaymentStatus(orderId, 'refunded');

        res.json({
            message: 'Refund processed successfully',
            refundId: refund.id
        });
    } catch (error) {
        logger.error('Error processing refund:', error);
        res.status(500).json({ error: 'Failed to process refund' });
    }
};

// Get payment details
const getPaymentDetails = async (req, res) => {
    try {
        const { paymentId } = req.params;
        const paymentDetails = await paymentService.getPaymentDetails(paymentId);
        res.json(paymentDetails);
    } catch (error) {
        logger.error('Error fetching payment details:', error);
        res.status(500).json({ error: 'Failed to fetch payment details' });
    }
};

// Handle Razorpay webhook
const handleWebhook = async (req, res) => {
  try {
    // Verify webhook signature
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    const signature = req.headers['x-razorpay-signature'];
    
    const shasum = crypto.createHmac('sha256', webhookSecret);
    shasum.update(JSON.stringify(req.body));
    const digest = shasum.digest('hex');
    
    if (signature !== digest) {
      return res.status(400).json({ message: 'Invalid webhook signature' });
    }

    await paymentService.handleWebhookEvent(req.body);
    res.json({ received: true });
  } catch (error) {
    logger.error('Error handling webhook:', error);
    res.status(400).json({ 
      message: error.message || 'Error handling webhook'
    });
  }
};

module.exports = {
    createPaymentOrder,
    verifyPayment,
    processRefund,
    getPaymentDetails,
    handleWebhook
}; 