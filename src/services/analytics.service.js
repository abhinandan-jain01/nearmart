import Analytics from '../models/analytics.model.js';
import { Order } from '../models/order.model.js';
import Product from '../models/product.model.js';
import Customer from '../models/customer.model.js';
import { logger } from '../utils/logger.js';

class AnalyticsService {
  async getRetailerAnalytics(retailerId, startDate, endDate) {
    try {
      const analytics = await Analytics.find({
        retailerId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      return analytics;
    } catch (error) {
      logger.error('Error fetching retailer analytics:', error);
      throw error;
    }
  }

  async updateDailyAnalytics(retailerId) {
    try {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      // Get existing analytics or create new
      let analytics = await Analytics.findOne({
        retailerId,
        date: today
      });

      if (!analytics) {
        analytics = new Analytics({
          retailerId,
          date: today
        });
      }

      // Fetch relevant data
      const [orders, products, customers] = await Promise.all([
        Order.find({
          retailerId,
          createdAt: { $gte: today }
        }),
        Product.find({ retailerId }),
        Customer.find({ 'orders.retailerId': retailerId })
      ]);

      // Update order metrics
      analytics.metrics.totalOrders = orders.length;
      analytics.metrics.totalRevenue = orders.reduce((sum, order) => sum + order.totalAmount, 0);
      
      // Update order status counts
      const statusCounts = orders.reduce((acc, order) => {
        acc[order.status] = (acc[order.status] || 0) + 1;
        return acc;
      }, {});
      analytics.metrics.orderStatus = {
        ...analytics.metrics.orderStatus,
        ...statusCounts
      };

      // Update product metrics
      analytics.metrics.totalProducts = products.length;
      analytics.metrics.activeProducts = products.filter(p => p.isActive).length;
      analytics.metrics.lowStockProducts = products.filter(p => p.stock < p.lowStockThreshold).length;
      analytics.metrics.outOfStockProducts = products.filter(p => p.stock === 0).length;

      // Update customer metrics
      analytics.metrics.totalCustomers = customers.length;
      analytics.metrics.newCustomers = customers.filter(c => 
        c.createdAt >= today
      ).length;

      // Update product-specific metrics
      analytics.productMetrics = products.map(product => ({
        productId: product._id,
        name: product.name,
        quantitySold: product.soldQuantity || 0,
        revenue: (product.soldQuantity || 0) * product.price,
        averageRating: product.averageRating || 0,
        totalReviews: product.reviews?.length || 0,
        stockLevel: product.stock,
        category: product.category
      }));

      // Update category metrics
      const categoryMetrics = products.reduce((acc, product) => {
        if (!acc[product.category]) {
          acc[product.category] = {
            totalOrders: 0,
            totalRevenue: 0,
            productCount: 0
          };
        }
        acc[product.category].productCount++;
        return acc;
      }, {});

      // Add order data to category metrics
      orders.forEach(order => {
        order.items.forEach(item => {
          const product = products.find(p => p._id.equals(item.productId));
          if (product && categoryMetrics[product.category]) {
            categoryMetrics[product.category].totalOrders++;
            categoryMetrics[product.category].totalRevenue += item.price * item.quantity;
          }
        });
      });

      analytics.categoryMetrics = Object.entries(categoryMetrics).map(([category, metrics]) => ({
        category,
        ...metrics,
        averageOrderValue: metrics.totalOrders > 0 
          ? metrics.totalRevenue / metrics.totalOrders 
          : 0
      }));

      // Calculate derived metrics
      analytics.calculateDailyMetrics();

      await analytics.save();
      return analytics;
    } catch (error) {
      logger.error('Error updating daily analytics:', error);
      throw error;
    }
  }

  async getProductAnalytics(retailerId, productId, startDate, endDate) {
    try {
      const analytics = await Analytics.find({
        retailerId,
        'productMetrics.productId': productId,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      return analytics.map(a => a.productMetrics.find(pm => pm.productId.equals(productId)));
    } catch (error) {
      logger.error('Error fetching product analytics:', error);
      throw error;
    }
  }

  async getCategoryAnalytics(retailerId, category, startDate, endDate) {
    try {
      const analytics = await Analytics.find({
        retailerId,
        'categoryMetrics.category': category,
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }).sort({ date: -1 });

      return analytics.map(a => a.categoryMetrics.find(cm => cm.category === category));
    } catch (error) {
      logger.error('Error fetching category analytics:', error);
      throw error;
    }
  }
}

export default new AnalyticsService(); 