import express from 'express';
import customerController from '../controllers/customer.controller.js';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';

const router = express.Router();

/**
 * @swagger
 * /api/customers/profile:
 *   get:
 *     summary: Get customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Customer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 name:
 *                   type: string
 *                 email:
 *                   type: string
 *                 phone:
 *                   type: string
 *                 addresses:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       type:
 *                         type: string
 *                       address:
 *                         type: string
 *                       city:
 *                         type: string
 *                       state:
 *                         type: string
 *                       country:
 *                         type: string
 *                       pincode:
 *                         type: string
 *                       isDefault:
 *                         type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', auth, authorize('customer'), customerController.getProfile);

/**
 * @swagger
 * /api/customers/profile:
 *   put:
 *     summary: Update customer profile
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', auth, authorize('customer'), customerController.updateProfile);

/**
 * @swagger
 * /api/customers/addresses:
 *   get:
 *     summary: Get customer addresses
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Addresses retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   id:
 *                     type: string
 *                   type:
 *                     type: string
 *                   address:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   country:
 *                     type: string
 *                   pincode:
 *                     type: string
 *                   isDefault:
 *                     type: boolean
 *       401:
 *         description: Unauthorized
 */
router.get('/addresses', auth, authorize('customer'), customerController.getAddresses);

/**
 * @swagger
 * /api/customers/addresses:
 *   post:
 *     summary: Add new address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - address
 *               - city
 *               - state
 *               - country
 *               - pincode
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address added successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/addresses', auth, authorize('customer'), customerController.addAddress);

/**
 * @swagger
 * /api/customers/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [home, work, other]
 *               address:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               country:
 *                 type: string
 *               pincode:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.put('/addresses/:addressId', auth, authorize('customer'), customerController.updateAddress);

/**
 * @swagger
 * /api/customers/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Customers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *           format: uuid
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Address not found
 */
router.delete('/addresses/:addressId', auth, authorize('customer'), customerController.deleteAddress);

// Authentication routes
router.post('/register', customerController.register);
router.post('/login', customerController.login);
router.get('/verify-email/:token', customerController.verifyEmail);
router.post('/request-password-reset', customerController.requestPasswordReset);
router.post('/reset-password', customerController.resetPassword);

// Protected routes
router.use(auth);

// Profile routes
router.put('/change-password', customerController.changePassword);

export default router;