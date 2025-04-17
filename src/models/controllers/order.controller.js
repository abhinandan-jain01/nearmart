import { Order, Product, Retailer, Customer } from '../models/index.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';

const orderController = {
  // Create a new order
  async createOrder(req, res) {
    try {
      const { retailerId, items, deliveryAddress, paymentMethod } = req.body;
      const customerId = req.user.id;

      // Validate retailer
      const retailer = await Retailer.findById(retailerId);
      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Validate products and calculate total
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          return res.status(404).json({ message: `Product ${item.productId} not found` });
        }

        if (product.stock < item.quantity) {
          return res.status(400).json({ message: `Insufficient stock for product ${product.name}` });
        }

        const itemTotal = product.price * item.quantity;
        totalAmount += itemTotal;

        orderItems.push({
          product: item.productId,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal
        });

        // Update product stock
        product.stock -= item.quantity;
        await product.save();
      }

      // Create order
      const order = new Order({
        customer: customerId,
        retailer: retailerId,
        items: orderItems,
        totalAmount,
        deliveryAddress,
        paymentMethod,
        status: 'pending'
      });

      await order.save();

      // Update retailer and customer stats
      await Retailer.findByIdAndUpdate(retailerId, {
        $inc: {
          'stats.totalOrders': 1,
          'stats.totalRevenue': totalAmount
        }
      });

      await Customer.findByIdAndUpdate(customerId, {
        $inc: {
          'stats.totalOrders': 1,
          'stats.totalSpent': totalAmount
        },
        $set: {
          'stats.lastOrderDate': new Date()
        }
      });

      res.status(201).json({
        message: 'Order created successfully',
        order: {
          id: order._id,
          totalAmount,
          status: order.status,
          createdAt: order.createdAt
        }
      });
    } catch (error) {
      logger.error('Create order error:', error);
      res.status(500).json({ message: 'Failed to create order', error: error.message });
    }
  },

  // Get customer orders
  async getCustomerOrders(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const customerId = req.user.id;
      const skip = (page - 1) * limit;

      const filter = {
        customer: customerId,
        ...(status && { status })
      };

      const orders = await Order.find(filter)
        .populate('retailer', 'businessName')
        .populate('items.product', 'name price')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(filter);

      res.json({
        orders,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Get customer orders error:', error);
      res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
  },

  // Get retailer orders
  async getRetailerOrders(req, res) {
    try {
      const { status, page = 1, limit = 10 } = req.query;
      const retailerId = req.user.id;
      const skip = (page - 1) * limit;

      const filter = {
        retailer: retailerId,
        ...(status && { status })
      };

      const orders = await Order.find(filter)
        .populate('customer', 'firstName lastName')
        .populate('items.product', 'name price')
        .sort('-createdAt')
        .skip(skip)
        .limit(parseInt(limit));

      const total = await Order.countDocuments(filter);

      res.json({
        orders,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Get retailer orders error:', error);
      res.status(500).json({ message: 'Failed to get orders', error: error.message });
    }
  },

  // Get order details
  async getOrderDetails(req, res) {
    try {
      const { orderId } = req.params;
      const userId = req.user.id;

      const order = await Order.findById(orderId)
        .populate('retailer', 'businessName phone address')
        .populate('customer', 'firstName lastName phone')
        .populate('items.product', 'name price');

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Check authorization
      if (req.user.role === 'customer' && order.customer.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }

      if (req.user.role === 'retailer' && order.retailer.toString() !== userId) {
        return res.status(403).json({ message: 'Not authorized to view this order' });
      }

      res.json(order);
    } catch (error) {
      logger.error('Get order details error:', error);
      res.status(500).json({ message: 'Failed to get order details', error: error.message });
    }
  },

  // Update order status
  async updateOrderStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status } = req.body;
      const retailerId = req.user.id;

      const order = await Order.findOne({
        _id: orderId,
        retailer: retailerId
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Validate status transition
      const validTransitions = {
        pending: ['confirmed', 'cancelled'],
        confirmed: ['preparing', 'cancelled'],
        preparing: ['ready', 'cancelled'],
        ready: ['delivered', 'cancelled'],
        delivered: [],
        cancelled: []
      };

      if (!validTransitions[order.status].includes(status)) {
        return res.status(400).json({ message: 'Invalid status transition' });
      }

      order.status = status;
      order.statusHistory.push({
        status,
        timestamp: new Date()
      });

      await order.save();

      res.json({
        message: 'Order status updated successfully',
        status: order.status
      });
    } catch (error) {
      logger.error('Update order status error:', error);
      res.status(500).json({ message: 'Failed to update order status', error: error.message });
    }
  },

  // Cancel order
  async cancelOrder(req, res) {
    try {
      const { orderId } = req.params;
      const customerId = req.user.id;

      const order = await Order.findOne({
        _id: orderId,
        customer: customerId,
        status: { $in: ['pending', 'confirmed'] }
      });

      if (!order) {
        return res.status(404).json({ message: 'Order not found or cannot be cancelled' });
      }

      // Restore product stock
      for (const item of order.items) {
        await Product.findByIdAndUpdate(item.product, {
          $inc: { stock: item.quantity }
        });
      }

      order.status = 'cancelled';
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date()
      });

      await order.save();

      // Update retailer and customer stats
      await Retailer.findByIdAndUpdate(order.retailer, {
        $inc: {
          'stats.totalOrders': -1,
          'stats.totalRevenue': -order.totalAmount
        }
      });

      await Customer.findByIdAndUpdate(customerId, {
        $inc: {
          'stats.totalOrders': -1,
          'stats.totalSpent': -order.totalAmount
        }
      });

      res.json({ message: 'Order cancelled successfully' });
    } catch (error) {
      logger.error('Cancel order error:', error);
      res.status(500).json({ message: 'Failed to cancel order', error: error.message });
    }
  },

  // Get order analytics
  async getOrderAnalytics(req, res) {
    try {
      const retailerId = req.user.id;
      const { startDate, endDate } = req.query;

      const filter = {
        retailer: retailerId,
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };

      const analytics = await Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: null,
            totalOrders: { $sum: 1 },
            totalRevenue: { $sum: '$totalAmount' },
            averageOrderValue: { $avg: '$totalAmount' }
          }
        }
      ]);

      const ordersByStatus = await Order.aggregate([
        { $match: filter },
        {
          $group: {
            _id: '$status',
            count: { $sum: 1 }
          }
        }
      ]);

      res.json({
        summary: analytics[0] || {
          totalOrders: 0,
          totalRevenue: 0,
          averageOrderValue: 0
        },
        ordersByStatus: ordersByStatus.reduce((acc, curr) => {
          acc[curr._id] = curr.count;
          return acc;
        }, {})
      });
    } catch (error) {
      logger.error('Get order analytics error:', error);
      res.status(500).json({ message: 'Failed to get order analytics', error: error.message });
    }
  },

  // Update payment status
  async updatePaymentStatus(req, res) {
    try {
      const { orderId } = req.params;
      const { status, transactionId, paymentMethod } = req.body;

      const order = await Order.findById(orderId);
      if (!order) {
        return res.status(404).json({ message: 'Order not found' });
      }

      // Validate payment status transition
      const validStatuses = ['pending', 'processing', 'completed', 'failed', 'refunded'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ message: 'Invalid payment status' });
      }

      // Update payment information
      order.payment = {
        ...order.payment,
        status,
        transactionId,
        paymentMethod,
        updatedAt: new Date()
      };

      // If payment is completed, update order status to confirmed
      if (status === 'completed' && order.status === 'pending') {
        order.status = 'confirmed';
        order.statusHistory.push({
          status: 'confirmed',
          timestamp: new Date()
        });
      }

      // If payment failed, update order status to cancelled
      if (status === 'failed' && order.status === 'pending') {
        order.status = 'cancelled';
        order.statusHistory.push({
          status: 'cancelled',
          timestamp: new Date()
        });

        // Restore product stock
        for (const item of order.items) {
          await Product.findByIdAndUpdate(item.product, {
            $inc: { stock: item.quantity }
          });
        }
      }

      await order.save();

      res.json({
        message: 'Payment status updated successfully',
        order: {
          id: order._id,
          status: order.status,
          payment: order.payment
        }
      });
    } catch (error) {
      logger.error('Update payment status error:', error);
      res.status(500).json({ message: 'Failed to update payment status', error: error.message });
    }
  }
};

export default orderController; 