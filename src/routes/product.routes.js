import express from 'express';
import { auth } from '../middleware/auth.js';
import { authorize } from '../middleware/authorize.js';
import { validateRequest, schemas } from '../middleware/validateRequest.js';
import productController from '../controllers/product.controller.js';

const router = express.Router();

/**
 * @swagger
 * /api/products:
 *   get:
 *     summary: Get all products
 *     description: Retrieve a list of all products with optional filtering
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *         description: Filter products by category
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: A list of products
 *       500:
 *         description: Server error
 */
router.get('/', productController.getProducts);

/**
 * @swagger
 * /api/products/{id}:
 *   get:
 *     summary: Get a product by ID
 *     description: Retrieve a single product by its ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product details
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.get('/:id', productController.getProduct);

/**
 * @swagger
 * /api/products/category/{category}:
 *   get:
 *     summary: Get products by category
 *     description: Retrieve all products in a specific category
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *         description: Product category
 *     responses:
 *       200:
 *         description: List of products in the category
 *       500:
 *         description: Server error
 */
router.get('/category/:category', productController.getProductsByCategory);

/**
 * @swagger
 * /api/products:
 *   post:
 *     summary: Create a new product
 *     description: Create a new product (retailer only)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - description
 *               - price
 *               - stock
 *               - category
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       201:
 *         description: Product created successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       500:
 *         description: Server error
 */
router.post('/', auth, authorize('retailer'), validateRequest(schemas.product), productController.createProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   put:
 *     summary: Update a product
 *     description: Update an existing product (retailer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               description:
 *                 type: string
 *               price:
 *                 type: number
 *               stock:
 *                 type: integer
 *               category:
 *                 type: string
 *     responses:
 *       200:
 *         description: Product updated successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.put('/:id', auth, authorize('retailer'), validateRequest(schemas.product), productController.updateProduct);

/**
 * @swagger
 * /api/products/{id}:
 *   delete:
 *     summary: Delete a product
 *     description: Delete a product (retailer only)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Product ID
 *     responses:
 *       200:
 *         description: Product deleted successfully
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 *       404:
 *         description: Product not found
 *       500:
 *         description: Server error
 */
router.delete('/:id', auth, authorize('retailer'), productController.deleteProduct);

// Public routes
router.get('/store/:storeId', productController.getStoreProducts);
router.get('/nearby', productController.getNearbyProducts);
router.get('/search', productController.searchProducts);
router.get('/categories', productController.getCategories);
router.get('/:productId', productController.getProductDetails);

// Protected routes
router.use(auth);

// Customer product actions
router.post('/:productId/review', productController.addReview);
router.get('/:productId/reviews', productController.getReviews);
router.post('/:productId/favorite', productController.addToFavorites);
router.delete('/:productId/favorite', productController.removeFromFavorites);

export default router; 