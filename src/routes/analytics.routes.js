import express from 'express';
import analyticsController from '../controllers/analytics.controller.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

// Get retailer analytics
router.get(
  '/retailer/:retailerId',
  auth,
  authorize(['retailer', 'admin']),
  analyticsController.getRetailerAnalytics
);

// Update daily analytics
router.post(
  '/retailer/:retailerId/update',
  auth,
  authorize(['retailer', 'admin']),
  analyticsController.updateDailyAnalytics
);

// Get product analytics
router.get(
  '/retailer/:retailerId/product/:productId',
  auth,
  authorize(['retailer', 'admin']),
  analyticsController.getProductAnalytics
);

// Get category analytics
router.get(
  '/retailer/:retailerId/category/:category',
  auth,
  authorize(['retailer', 'admin']),
  analyticsController.getCategoryAnalytics
);

export default router; 