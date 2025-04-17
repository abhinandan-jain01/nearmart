import { startServer, stopServer } from './setup.js';
import assert from 'assert';
import axios from 'axios';
import dotenv from 'dotenv';
import { dirname, join } from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env.test') });

const API_URL = `http://localhost:${process.env.PORT || 3001}/api`;

let customerToken;
let retailerToken;
let testProductId;
let testRetailerId;
let testOrderId;

// Helper function to make authenticated requests
const makeAuthRequest = async (method, url, data = null, token) => {
  try {
    const headers = token ? { Authorization: `Bearer ${token}` } : {};
    const response = await axios({
      method,
      url: `${API_URL}${url}`,
      data,
      headers,
      validateStatus: (status) => true // Don't throw on any status code
    });
    
    // Return the response data as is
    return response.data;
  } catch (error) {
    // If there's a network error or other non-HTTP error, format it like our middleware would
    return {
      success: false,
      message: error.message,
      errors: error.stack
    };
  }
};

// Test suite
describe('API Tests', () => {
  // Setup and teardown
  beforeAll(async () => {
    await startServer();
  });

  afterAll(async () => {
    await stopServer();
  });

  // Retailer registration and login
  describe('Retailer Authentication', () => {
    it('should register a new retailer', async () => {
      const retailerData = {
        email: 'test.retailer@example.com',
        password: 'password123',
        businessName: 'Test Retailer',
        phone: '1234567890',
        businessType: 'store',
        taxId: '123456789',
        address: {
          street: '123 Test St',
          city: 'Test City',
          state: 'TS',
          postalCode: '12345',
          country: 'US'
        }
      };

      const response = await makeAuthRequest('post', '/retailers/register', retailerData);
      expect(response.success).toBe(true);
      expect(response.data.retailer).toBeDefined();
      testRetailerId = response.data.retailer._id;
    });

    it('should login as retailer', async () => {
      const loginData = {
        email: 'test.retailer@example.com',
        password: 'password123'
      };

      const response = await makeAuthRequest('post', '/retailers/login', loginData);
      expect(response.success).toBe(true);
      expect(response.data.token).toBeDefined();
      retailerToken = response.data.token;
    });
  });

  // Location services
  describe('Location Services', () => {
    it('should add retailer location', async () => {
      const locationData = {
        address: {
          street: '456 Retail St',
          city: 'Retail City',
          state: 'RC',
          postalCode: '54321',
          country: 'US'
        },
        isActive: true
      };

      const response = await makeAuthRequest(
        'post',
        '/retailers/locations',
        locationData,
        retailerToken
      );
      expect(response.success).toBe(true);
    });

    it('should find nearby retailers', async () => {
      const coordinates = [-122.4194, 37.7749]; // San Francisco coordinates
      const response = await makeAuthRequest(
        'get',
        `/retailers/nearby?lat=${coordinates[1]}&lng=${coordinates[0]}&maxDistance=10000`,
        null,
        retailerToken
      );
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
    });

    it('should handle invalid coordinates', async () => {
      const response = await makeAuthRequest(
        'get',
        '/retailers/nearby?lat=invalid&lng=invalid',
        null,
        retailerToken
      );
      expect(response.success).toBe(false);
      expect(response.message).toBe('Invalid coordinates');
    });
  });

  // Customer registration and login
  describe('Customer Authentication', () => {
    it('should register a new customer', async () => {
      const customerData = {
        email: 'test.customer@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'Customer',
        phone: '0987654321'
      };

      const response = await makeAuthRequest('post', '/customers/register', customerData);
      expect(response.success).toBe(true);
      expect(response.data.user).toBeDefined();
    });

    it('should login as customer', async () => {
      const loginData = {
        email: 'test.customer@example.com',
        password: 'password123'
      };

      const response = await makeAuthRequest('post', '/customers/login', loginData);
      expect(response.success).toBe(true);
      expect(response.data.token).toBeDefined();
      customerToken = response.data.token;
    });
  });

  // Product management
  describe('Product Management', () => {
    it('should create a new product', async () => {
      const productData = {
        name: 'Test Product',
        description: 'A test product description',
        price: 99.99,
        stock: 10,
        category: 'Electronics',
        image: 'https://example.com/image.jpg'
      };

      const response = await makeAuthRequest('post', '/products', productData, retailerToken);
      expect(response.success).toBe(true);
      expect(response.data._id).toBeDefined();
      testProductId = response.data._id;
    });

    it('should get product details', async () => {
      const response = await makeAuthRequest('get', `/products/${testProductId}`);
      expect(response.success).toBe(true);
      expect(response.data.name).toBe('Test Product');
    });

    it('should update product', async () => {
      const updateData = {
        price: 89.99,
        stock: 15
      };

      const response = await makeAuthRequest('put', `/products/${testProductId}`, updateData, retailerToken);
      expect(response.success).toBe(true);
      expect(response.data.price).toBe(89.99);
    });
  });

  // Cart operations
  describe('Cart Operations', () => {
    it('should add item to cart', async () => {
      const cartItem = {
        productId: testProductId,
        quantity: 2
      };

      const response = await makeAuthRequest('post', '/cart/items', cartItem, customerToken);
      expect(response.success).toBe(true);
      expect(response.data.items).toBeDefined();
    });

    it('should get cart contents', async () => {
      const response = await makeAuthRequest('get', '/cart', null, customerToken);
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data.items)).toBe(true);
      expect(response.data.items[0].productId).toBe(testProductId);
    });

    it('should update cart item quantity', async () => {
      const updateData = {
        quantity: 3
      };

      const response = await makeAuthRequest('put', `/cart/items/${testProductId}`, updateData, customerToken);
      expect(response.success).toBe(true);
      expect(response.data.items[0].quantity).toBe(3);
    });

    it('should remove item from cart', async () => {
      const response = await makeAuthRequest('delete', `/cart/items/${testProductId}`, null, customerToken);
      expect(response.success).toBe(true);
      expect(response.data.items.length).toBe(0);
    });
  });

  // Order management
  describe('Order Management', () => {
    it('should create a new order', async () => {
      const orderData = {
        items: [{
          productId: testProductId,
          quantity: 2
        }],
        shippingAddress: {
          street: '123 Customer St',
          city: 'Customer City',
          state: 'CC',
          postalCode: '12345',
          country: 'US'
        },
        paymentMethod: 'credit_card'
      };

      const response = await makeAuthRequest('post', '/orders', orderData, customerToken);
      expect(response.success).toBe(true);
      expect(response.data._id).toBeDefined();
      testOrderId = response.data._id;
    });

    it('should get order details', async () => {
      const response = await makeAuthRequest('get', `/orders/${testOrderId}`, null, customerToken);
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('pending');
    });

    it('should update order status', async () => {
      const updateData = {
        status: 'processing'
      };

      const response = await makeAuthRequest('put', `/orders/${testOrderId}/status`, updateData, retailerToken);
      expect(response.success).toBe(true);
      expect(response.data.status).toBe('processing');
    });

    it('should get order history', async () => {
      const response = await makeAuthRequest('get', '/orders', null, customerToken);
      expect(response.success).toBe(true);
      expect(Array.isArray(response.data)).toBe(true);
      expect(response.data.length).toBeGreaterThan(0);
    });
  });
}); 