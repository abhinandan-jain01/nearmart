import express from 'express';
import storeController from '../controllers/store.controller.js';
import { auth } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/nearby', storeController.getNearbyStores);
router.get('/search', storeController.searchStores);
router.get('/categories', storeController.getStoreCategories);
router.get('/:storeId', storeController.getStoreDetails);

// Protected routes
router.use(auth);

// Customer store actions
router.post('/:storeId/favorite', storeController.addToFavorites);
router.delete('/:storeId/favorite', storeController.removeFromFavorites);
router.post('/:storeId/review', storeController.addReview);
router.get('/:storeId/reviews', storeController.getReviews);

export default router; 