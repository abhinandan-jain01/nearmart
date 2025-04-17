const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const auth = require('../middleware/auth');
const authorize = require('../middleware/authorize');

/**
 * @swagger
 * /api/addresses:
 *   post:
 *     summary: Create a new address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - addressLine1
 *               - city
 *               - state
 *               - postalCode
 *               - country
 *             properties:
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Address created successfully
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Unauthorized
 */
router.post('/', auth, addressController.createAddress);

/**
 * @swagger
 * /api/addresses:
 *   get:
 *     summary: Get all addresses for the authenticated user
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of addresses
 *       401:
 *         description: Unauthorized
 */
router.get('/', auth, addressController.getAddresses);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   get:
 *     summary: Get address by ID
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address details
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:addressId', auth, addressController.getAddressById);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   put:
 *     summary: Update address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
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
 *               addressLine1:
 *                 type: string
 *               addressLine2:
 *                 type: string
 *               city:
 *                 type: string
 *               state:
 *                 type: string
 *               postalCode:
 *                 type: string
 *               country:
 *                 type: string
 *               isDefault:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Address updated successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:addressId', auth, addressController.updateAddress);

/**
 * @swagger
 * /api/addresses/{addressId}:
 *   delete:
 *     summary: Delete address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Address deleted successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:addressId', auth, addressController.deleteAddress);

/**
 * @swagger
 * /api/addresses/{addressId}/default:
 *   put:
 *     summary: Set address as default
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: addressId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Default address set successfully
 *       404:
 *         description: Address not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:addressId/default', auth, addressController.setDefaultAddress);

/**
 * @swagger
 * /api/addresses/default:
 *   get:
 *     summary: Get default address
 *     tags: [Addresses]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Default address details
 *       404:
 *         description: No default address found
 *       401:
 *         description: Unauthorized
 */
router.get('/default', auth, addressController.getDefaultAddress);

module.exports = router; 