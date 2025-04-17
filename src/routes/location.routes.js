import express from 'express';
import { auth } from '../middleware/auth.js';
import authorize from '../middleware/authorize.js';
import {
  // Customer location routes
  addCustomerLocation,
  getCustomerLocations,
  updateCustomerLocation,
  deleteCustomerLocation,
  
  // Retailer location routes
  addRetailerLocation,
  getRetailerLocations,
  updateRetailerLocation,
  deleteRetailerLocation,
  
  // Common routes
  findNearbyRetailers,
  getBusinessCategories
} from '../controllers/location.controller.js';

const router = express.Router();

// Customer location routes
router.post('/customer', auth, authorize('customer'), addCustomerLocation);
router.get('/customer', auth, authorize('customer'), getCustomerLocations);
router.put('/customer/:locationId', auth, authorize('customer'), updateCustomerLocation);
router.delete('/customer/:locationId', auth, authorize('customer'), deleteCustomerLocation);

// Retailer location routes
router.post('/retailer', auth, authorize('retailer'), addRetailerLocation);
router.get('/retailer', auth, authorize('retailer'), getRetailerLocations);
router.put('/retailer/:locationId', auth, authorize('retailer'), updateRetailerLocation);
router.delete('/retailer/:locationId', auth, authorize('retailer'), deleteRetailerLocation);

// Common routes
router.get('/nearby', findNearbyRetailers);
router.get('/categories', getBusinessCategories);

export default router; 