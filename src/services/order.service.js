import { Order, OrderItem } from '../models/order.model.js';
import { Product, User, Retailer } from '../models/index.js';
import productService from './product.service.js';
import { logger } from '../utils/logger.js';

class OrderService {
  // Create a new order
  async createOrder(customerId, orderData) {
    try {
      const { items, shippingAddress, paymentMethod } = orderData;

      // Calculate total amount and validate stock
      let totalAmount = 0;
      const orderItems = [];

      for (const item of items) {
        const product = await Product.findById(item.productId);
        if (!product) {
          throw new Error(`Product ${item.productId} not found`);
        }

        if (product.stock < item.quantity) {
          throw new Error(`Insufficient stock for product ${product.name}`);
        }

        totalAmount += product.price * item.quantity;
        orderItems.push({
          productId: item.productId,
          quantity: item.quantity,
          price: product.price,
          retailerId: product.retailerId
        });
      }

      // Create order with a unique order number
      const order = await Order.create({
        orderNumber: `ORD-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        customerId,
        retailerId: orderItems[0].retailerId, // Assuming single retailer per order
        totalAmount,
        status: 'pending',
        paymentStatus: 'pending',
        paymentMethod,
        shippingAddress
      });

      // Create order items and update stock
      for (const item of orderItems) {
        await OrderItem.create({
          orderId: order._id,
          ...item
        });

        // Update product stock
        await productService.updateStock(
          item.productId,
          item.retailerId,
          item.quantity,
          'subtract'
        );
      }

      return this.getOrderById(order._id);
    } catch (error) {
      logger.error('Error creating order:', error);
      throw error;
    }
  }

  // Get order by ID
  async getOrderById(orderId) {
    try {
      const order = await Order.findById(orderId)
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            select: 'name description images'
          }
        })
        .populate('customer', 'firstName lastName email')
        .populate('retailer', 'businessName email');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Error fetching order:', error);
      throw error;
    }
  }

  // Get customer orders
  async getCustomerOrders(customerId, filters = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 10
      } = filters;

      const query = { customerId };
      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const orders = await Order.find(query)
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            select: 'name images'
          }
        })
        .populate('retailer', 'businessName')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching customer orders:', error);
      throw error;
    }
  }

  // Get retailer orders
  async getRetailerOrders(retailerId, filters = {}) {
    try {
      const {
        status,
        page = 1,
        limit = 10
      } = filters;

      const query = { retailerId };
      if (status) query.status = status;

      const skip = (page - 1) * limit;
      const orders = await Order.find(query)
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            select: 'name images'
          }
        })
        .populate('customer', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit);

      const total = await Order.countDocuments(query);

      return {
        orders,
        total,
        page,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error fetching retailer orders:', error);
      throw error;
    }
  }

  // Update order status
  async updateOrderStatus(orderId, retailerId, status) {
    try {
      const order = await Order.findOne({ _id: orderId, retailerId });
      if (!order) {
        throw new Error('Order not found');
      }

      order.status = status;
      await order.save();

      return this.getOrderById(orderId);
    } catch (error) {
      logger.error('Error updating order status:', error);
      throw error;
    }
  }

  // Update payment status
  async updatePaymentStatus(orderId, paymentStatus, paymentId) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      order.paymentStatus = paymentStatus;
      if (paymentId) {
        order.paymentId = paymentId;
      }

      await order.save();
      return this.getOrderById(orderId);
    } catch (error) {
      logger.error('Error updating payment status:', error);
      throw error;
    }
  }

  // Cancel order
  async cancelOrder(orderId, customerId) {
    try {
      const order = await Order.findOne({ _id: orderId, customerId });
      if (!order) {
        throw new Error('Order not found');
      }

      if (!['pending', 'confirmed'].includes(order.status)) {
        throw new Error('Cannot cancel order in current status');
      }

      order.status = 'cancelled';
      await order.save();

      // Restore product stock
      const orderItems = await OrderItem.find({ orderId });
      for (const item of orderItems) {
        await productService.updateStock(
          item.productId,
          item.retailerId,
          item.quantity,
          'add'
        );
      }

      return this.getOrderById(orderId);
    } catch (error) {
      logger.error('Error cancelling order:', error);
      throw error;
    }
  }

  // Get order by payment ID
  async getOrderByPaymentId(paymentId) {
    try {
      const order = await Order.findOne({ paymentId })
        .populate({
          path: 'items',
          populate: {
            path: 'product',
            select: 'name description images'
          }
        })
        .populate('customer', 'id firstName lastName email')
        .populate('retailer', 'id businessName email');

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    } catch (error) {
      logger.error('Error getting order by payment ID:', error);
      throw error;
    }
  }

  // Update order
  async updateOrder(orderId, updateData) {
    try {
      const order = await Order.findById(orderId);
      if (!order) {
        throw new Error('Order not found');
      }

      await order.updateOne(updateData);
      return this.getOrderById(orderId);
    } catch (error) {
      logger.error('Error updating order:', error);
      throw error;
    }
  }
}

const orderService = new OrderService();
export default orderService; 