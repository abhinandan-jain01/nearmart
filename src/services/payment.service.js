const Razorpay = require('razorpay');
const orderService = require('./order.service');
const logger = require('../utils/logger');
const crypto = require('crypto');
const { getSocketIO } = require('../config/socket');
const notificationService = require('./notification.service');

class PaymentService {
  constructor() {
    this.razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID,
      key_secret: process.env.RAZORPAY_KEY_SECRET
    });
  }

  // Helper method to emit payment events
  emitPaymentEvent(userId, eventName, data) {
    try {
      const io = getSocketIO();
      io.to(userId).emit(eventName, data);
    } catch (error) {
      logger.error('Error emitting payment event:', error);
    }
  }

  // Create a payment order for Razorpay
  async createOrder(amount, currency = 'INR') {
    try {
      const options = {
        amount: amount * 100, // Razorpay expects amount in paise
        currency,
        receipt: `order_${Date.now()}`,
        payment_capture: 1
      };

      const order = await this.razorpay.orders.create(options);
      return order;
    } catch (error) {
      logger.error('Error creating Razorpay order:', error);
      throw error;
    }
  }

  // Verify payment signature
  async verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature) {
    try {
      const secret = process.env.RAZORPAY_KEY_SECRET;
      
      // Create signature
      const body = razorpay_order_id + '|' + razorpay_payment_id;
      const expectedSignature = crypto
        .createHmac('sha256', secret)
        .update(body.toString())
        .digest('hex');

      // Verify signature
      const isValid = expectedSignature === razorpay_signature;
      return isValid;
    } catch (error) {
      logger.error('Error verifying payment:', error);
      throw new Error('Failed to verify payment');
    }
  }

  // Handle successful payment
  async handlePaymentSuccess(paymentData) {
    try {
      const { razorpay_order_id, razorpay_payment_id } = paymentData;

      // Verify the payment signature
      await this.verifyPayment(razorpay_order_id, razorpay_payment_id, paymentData.razorpay_signature);

      // Fetch the Razorpay order
      const razorpayOrder = await this.razorpay.orders.fetch(razorpay_order_id);
      const orderId = razorpayOrder.notes.orderId;

      // Update the order payment status
      await orderService.updatePaymentStatus(orderId, 'paid', razorpay_payment_id);

      // Send notification
      const order = await orderService.getOrderById(orderId);
      await notificationService.sendPaymentStatusNotification(order, 'paid');

      return { success: true, orderId };
    } catch (error) {
      logger.error('Error handling payment success:', error);
      throw error;
    }
  }

  // Process refund
  async refundPayment(paymentId, amount) {
    try {
      const refund = await this.razorpay.payments.refund(paymentId, {
        amount: amount * 100, // Convert to paise
        notes: {
          refund_reason: 'Order cancellation'
        }
      });
      return refund;
    } catch (error) {
      logger.error('Error processing refund:', error);
      throw new Error('Failed to process refund');
    }
  }

  // Handle Razorpay webhook events
  async handleWebhookEvent(event) {
    try {
      switch (event.event) {
        case 'payment.captured':
          await this.handlePaymentSuccess({
            razorpay_order_id: event.payload.order.entity.id,
            razorpay_payment_id: event.payload.payment.entity.id,
            razorpay_signature: event.payload.payment.entity.signature
          });
          break;
        case 'payment.failed':
          const orderId = event.payload.order.entity.notes.orderId;
          await orderService.updatePaymentStatus(orderId, 'failed');
          break;
        // Add more event handlers as needed
      }
      return { success: true };
    } catch (error) {
      logger.error('Error handling webhook event:', error);
      throw error;
    }
  }

  async getPaymentDetails(paymentId) {
    try {
      const payment = await this.razorpay.payments.fetch(paymentId);
      return payment;
    } catch (error) {
      logger.error('Error fetching payment details:', error);
      throw new Error('Failed to fetch payment details');
    }
  }
}

module.exports = new PaymentService(); 