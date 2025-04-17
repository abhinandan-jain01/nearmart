import analyticsService from '../services/analytics.service.js';
import { validateRequest } from '../middleware/validateRequest.js';
import { logger } from '../utils/logger.js';

const analyticsController = {
  async getRetailerAnalytics(req, res) {
    try {
      const { retailerId } = req.params;
      const { startDate, endDate } = req.query;

      // Validate dates
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const analytics = await analyticsService.getRetailerAnalytics(
        retailerId,
        start,
        end
      );

      res.success(analytics);
    } catch (error) {
      logger.error('Error in getRetailerAnalytics:', error);
      res.error(error.message, error.status || 500);
    }
  },

  async updateDailyAnalytics(req, res) {
    try {
      const { retailerId } = req.params;
      const analytics = await analyticsService.updateDailyAnalytics(retailerId);
      res.success(analytics);
    } catch (error) {
      logger.error('Error in updateDailyAnalytics:', error);
      res.error(error.message, error.status || 500);
    }
  },

  async getProductAnalytics(req, res) {
    try {
      const { retailerId, productId } = req.params;
      const { startDate, endDate } = req.query;

      // Validate dates
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const analytics = await analyticsService.getProductAnalytics(
        retailerId,
        productId,
        start,
        end
      );

      res.success(analytics);
    } catch (error) {
      logger.error('Error in getProductAnalytics:', error);
      res.error(error.message, error.status || 500);
    }
  },

  async getCategoryAnalytics(req, res) {
    try {
      const { retailerId, category } = req.params;
      const { startDate, endDate } = req.query;

      // Validate dates
      const start = startDate ? new Date(startDate) : new Date();
      const end = endDate ? new Date(endDate) : new Date();
      
      start.setHours(0, 0, 0, 0);
      end.setHours(23, 59, 59, 999);

      const analytics = await analyticsService.getCategoryAnalytics(
        retailerId,
        category,
        start,
        end
      );

      res.success(analytics);
    } catch (error) {
      logger.error('Error in getCategoryAnalytics:', error);
      res.error(error.message, error.status || 500);
    }
  }
};

export default analyticsController; 