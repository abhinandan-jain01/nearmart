import express from 'express';
import { auth } from '../middleware/auth.js';
import retailerAuthController from '../controllers/retailer.auth.controller.js';

const router = express.Router();

// Public routes
router.post('/register', retailerAuthController.register);
router.post('/login', retailerAuthController.login);

// Protected routes
router.get('/profile', auth, retailerAuthController.getProfile);
router.put('/profile', auth, retailerAuthController.updateProfile);

export default router; 