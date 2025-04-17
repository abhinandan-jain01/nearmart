import axios from 'axios';
import { logger } from './logger.js';

const API_URL = `http://localhost:${process.env.PORT || 3001}/api`;

/**
 * Makes an authenticated request to the API
 * @param {string} method - HTTP method (get, post, put, delete)
 * @param {string} url - API endpoint URL (without the base URL)
 * @param {object} [data=null] - Request body data
 * @param {string} [token=null] - Authentication token
 * @param {object} [customHeaders={}] - Additional headers
 * @returns {Promise<object>} Response object with success, status, and data/error
 */
export const makeAuthRequest = async (method, url, data = null, token = null, customHeaders = {}) => {
  try {
    const headers = {
      ...customHeaders,
      ...(token && { Authorization: `Bearer ${token}` })
    };

    const config = {
      method,
      url: `${API_URL}${url}`,
      headers,
      data,
      validateStatus: () => true // Don't throw on any status code
    };

    logger.debug(`Making ${method.toUpperCase()} request to ${url}`, { data });
    const response = await axios(config);

    // Log non-2xx responses for debugging
    if (response.status >= 300) {
      logger.debug(`Received ${response.status} response`, { 
        url,
        status: response.status,
        data: response.data 
      });
    }

    return {
      success: response.status < 300,
      status: response.status,
      data: response.data,
      headers: response.headers
    };
  } catch (error) {
    logger.error(`Request failed for ${url}`, { error: error.message });
    return {
      success: false,
      status: error.response?.status || 500,
      error: {
        message: error.response?.data?.message || error.message,
        details: error.response?.data || error.stack
      }
    };
  }
};

/**
 * Helper function to create test data
 */
export const testData = {
  customer: {
    firstName: 'Test',
    lastName: 'Customer',
    email: 'test.customer@example.com',
    password: 'Test@123',
    phone: '1234567890'
  },
  retailer: {
    email: 'test.retailer@example.com',
    password: 'Test@123',
    businessName: 'Test Store',
    phone: '1234567890',
    businessType: 'retail',
    taxId: 'TAX123456',
    address: {
      street: '123 Test St',
      city: 'Test City',
      state: 'TS',
      country: 'Test Country',
      zipCode: '12345'
    }
  },
  product: {
    name: 'Test Product',
    description: 'A test product description',
    price: 99.99,
    stock: 10,
    category: 'Electronics',
    image: 'https://example.com/test-product.jpg'
  }
};

/**
 * Helper function to authenticate and get tokens
 */
export const getAuthTokens = async () => {
  // Register and login customer
  await makeAuthRequest('post', '/auth/customer/register', testData.customer);
  const customerLogin = await makeAuthRequest('post', '/auth/customer/login', {
    email: testData.customer.email,
    password: testData.customer.password
  });

  // Register and login retailer
  await makeAuthRequest('post', '/auth/retailer/register', testData.retailer);
  const retailerLogin = await makeAuthRequest('post', '/auth/retailer/login', {
    email: testData.retailer.email,
    password: testData.retailer.password
  });

  return {
    customerToken: customerLogin.data.token,
    retailerToken: retailerLogin.data.token
  };
}; 