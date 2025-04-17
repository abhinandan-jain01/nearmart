import request from 'supertest';
import mongoose from 'mongoose';
import { app, startServer } from '../server.js';
import User from '../models/user.model.js';
import Customer from '../models/customer.model.js';
import Retailer from '../models/retailer.model.js';

describe('API Tests', () => {
  let customerToken;
  let retailerToken;
  let server;

  beforeAll(async () => {
    process.env.NODE_ENV = 'test';
    process.env.MONGODB_URI = process.env.MONGODB_URI.replace(
      'business_db',
      'business_test_db'
    );
    server = await startServer(0); // Use port 0 to get a random available port
  });

  afterAll(async () => {
    await mongoose.connection.dropDatabase();
    await mongoose.connection.close();
    await server.close();
  });

  beforeEach(async () => {
    // Clear all collections before each test
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Retailer.deleteMany({});
  });

  describe('Customer Authentication', () => {
    it('should register a new customer', async () => {
      const res = await request(app)
        .post('/api/auth/customer/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should login a customer', async () => {
      // First register a customer
      await request(app)
        .post('/api/auth/customer/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      // Then try to login
      const res = await request(app)
        .post('/api/auth/customer/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      customerToken = res.body.data.token;
    });

    it('should get customer profile', async () => {
      // First register and login
      await request(app)
        .post('/api/auth/customer/register')
        .send({
          firstName: 'John',
          lastName: 'Doe',
          email: 'john.doe@example.com',
          password: 'password123',
          phone: '1234567890'
        });

      const loginRes = await request(app)
        .post('/api/auth/customer/login')
        .send({
          email: 'john.doe@example.com',
          password: 'password123'
        });

      customerToken = loginRes.body.data.token;

      // Then get profile
      const res = await request(app)
        .get('/api/auth/customer/profile')
        .set('Authorization', `Bearer ${customerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('firstName');
      expect(res.body.data).toHaveProperty('lastName');
    });
  });

  describe('Retailer Authentication', () => {
    it('should register a new retailer', async () => {
      const res = await request(app)
        .post('/api/auth/retailer/register')
        .send({
          email: 'retailer@example.com',
          password: 'password123',
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
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.user).toHaveProperty('email');
      expect(res.body.data).toHaveProperty('token');
    });

    it('should login a retailer', async () => {
      // First register a retailer
      await request(app)
        .post('/api/auth/retailer/register')
        .send({
          email: 'retailer@example.com',
          password: 'password123',
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
        });

      // Then try to login
      const res = await request(app)
        .post('/api/auth/retailer/login')
        .send({
          email: 'retailer@example.com',
          password: 'password123'
        });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('token');
      retailerToken = res.body.data.token;
    });

    it('should get retailer profile', async () => {
      // First register and login
      await request(app)
        .post('/api/auth/retailer/register')
        .send({
          email: 'retailer@example.com',
          password: 'password123',
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
        });

      const loginRes = await request(app)
        .post('/api/auth/retailer/login')
        .send({
          email: 'retailer@example.com',
          password: 'password123'
        });

      retailerToken = loginRes.body.data.token;

      // Then get profile
      const res = await request(app)
        .get('/api/auth/retailer/profile')
        .set('Authorization', `Bearer ${retailerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data).toHaveProperty('businessName');
      expect(res.body.data).toHaveProperty('businessType');
    });
  });
}); 