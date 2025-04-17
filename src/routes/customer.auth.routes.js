import express from 'express';
import { auth } from '../middleware/auth.js';
import customerAuthController from '../controllers/customer.auth.controller.js';

const router = express.Router();

// Public routes
router.post('/register', customerAuthController.register);
router.post('/login', customerAuthController.login);

// Protected routes
router.get('/profile', auth, customerAuthController.getProfile);
router.put('/profile', auth, customerAuthController.updateProfile);

export default router; 