import express from 'express';
import retailerController from '../controllers/retailer.controller.js';
import { auth, authorize } from '../middleware/auth.js';

const router = express.Router();

/**
 * @swagger
 * /api/retailers/register:
 *   post:
 *     summary: Register a new retailer
 *     tags: [Retailers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *               - businessName
 *               - phone
 *               - businessType
 *               - taxId
 *               - address
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *               businessName:
 *                 type: string
 *               phone:
 *                 type: string
 *               businessType:
 *                 type: string
 *               taxId:
 *                 type: string
 *               address:
 *                 type: object
 *                 properties:
 *                   street:
 *                     type: string
 *                   city:
 *                     type: string
 *                   state:
 *                     type: string
 *                   postalCode:
 *                     type: string
 *                   country:
 *                     type: string
 *     responses:
 *       201:
 *         description: Retailer registered successfully
 *       400:
 *         description: Invalid input
 */
router.post('/register', retailerController.register);

/**
 * @swagger
 * /api/retailers/login:
 *   post:
 *     summary: Login as retailer
 *     tags: [Retailers]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       401:
 *         description: Invalid credentials
 */
router.post('/login', retailerController.login);

// Protected routes
router.use(auth);

/**
 * @swagger
 * /api/retailers/profile:
 *   get:
 *     summary: Get retailer profile
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Retailer profile retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: string
 *                   format: uuid
 *                 businessName:
 *                   type: string
 *                 businessType:
 *                   type: string
 *                 gstNumber:
 *                   type: string
 *                 panNumber:
 *                   type: string
 *                 phoneNumber:
 *                   type: string
 *                 email:
 *                   type: string
 *                 isActive:
 *                   type: boolean
 *                 createdAt:
 *                   type: string
 *                   format: date-time
 *                 updatedAt:
 *                   type: string
 *                   format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/profile', authorize(['retailer']), retailerController.getProfile);

/**
 * @swagger
 * /api/retailers/profile:
 *   put:
 *     summary: Update retailer profile
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               businessName:
 *                 type: string
 *               businessType:
 *                 type: string
 *               gstNumber:
 *                 type: string
 *               panNumber:
 *                 type: string
 *               phoneNumber:
 *                 type: string
 *     responses:
 *       200:
 *         description: Profile updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/profile', authorize(['retailer']), retailerController.updateProfile);

/**
 * @swagger
 * /api/retailers/change-password:
 *   put:
 *     summary: Change retailer password
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               currentPassword:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Password changed successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/change-password', authorize(['retailer']), retailerController.changePassword);

/**
 * @swagger
 * /api/retailers/dashboard:
 *   get:
 *     summary: Get retailer dashboard data
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 totalOrders:
 *                   type: number
 *                 totalRevenue:
 *                   type: number
 *                 pendingOrders:
 *                   type: number
 *                 totalProducts:
 *                   type: number
 *                 recentOrders:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       id:
 *                         type: string
 *                       orderNumber:
 *                         type: string
 *                       customerName:
 *                         type: string
 *                       amount:
 *                         type: number
 *                       status:
 *                         type: string
 *                       createdAt:
 *                         type: string
 *                         format: date-time
 *       401:
 *         description: Unauthorized
 */
router.get('/dashboard', authorize(['retailer']), retailerController.getDashboard);

/**
 * @swagger
 * /api/retailers/analytics:
 *   get:
 *     summary: Get retailer analytics
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: string
 *           format: date
 *         description: Start date for analytics
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: string
 *           format: date
 *         description: End date for analytics
 *     responses:
 *       200:
 *         description: Analytics data retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 salesByDay:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       date:
 *                         type: string
 *                         format: date
 *                       amount:
 *                         type: number
 *                 topProducts:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       productId:
 *                         type: string
 *                       name:
 *                         type: string
 *                       quantity:
 *                         type: number
 *                       revenue:
 *                         type: number
 *       401:
 *         description: Unauthorized
 */
router.get('/analytics', authorize(['retailer']), retailerController.getAnalytics);

/**
 * @swagger
 * /api/retailers/settings:
 *   get:
 *     summary: Get retailer settings
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/settings', authorize(['retailer']), retailerController.getSettings);

/**
 * @swagger
 * /api/retailers/settings:
 *   put:
 *     summary: Update retailer settings
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               storeTimings:
 *                 type: object
 *               deliveryAreas:
 *                 type: array
 *               features:
 *                 type: object
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.put('/settings', authorize(['retailer']), retailerController.updateSettings);

/**
 * @swagger
 * /api/retailers/products:
 *   get:
 *     summary: Get retailer products
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Products retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/products', authorize(['retailer']), retailerController.getProducts);

/**
 * @swagger
 * /api/retailers/products/{productId}/status:
 *   put:
 *     summary: Update product status
 *     tags: [Retailers]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Product status updated successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 *       404:
 *         description: Product not found
 */
router.put('/products/:productId/status', authorize(['retailer']), retailerController.updateProductStatus);

// Product routes
router.post('/products', authorize(['retailer']), retailerController.addProduct);
router.put('/products/:productId', authorize(['retailer']), retailerController.updateProduct);
router.delete('/products/:productId', authorize(['retailer']), retailerController.deleteProduct);

// Order routes
router.get('/orders', authorize(['retailer']), retailerController.getOrders);
router.patch('/orders/:orderId/status', authorize(['retailer']), retailerController.updateOrderStatus);

// Search retailers (public endpoint)
router.get('/search', retailerController.searchRetailers);

// Reviews
router.get('/:retailerId/reviews', retailerController.getReviews);
router.post('/:retailerId/reviews', auth, retailerController.addReview);

// Store management (retailer only)
router.put('/store-timings', auth, authorize(['retailer']), retailerController.updateStoreTimings);
router.put('/delivery-areas', auth, authorize(['retailer']), retailerController.updateDeliveryAreas);

export default router; 