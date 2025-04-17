import sinon from 'sinon';
import { successResponse, errorHandler } from '../../middleware/response.middleware.js';

describe('Response Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {};
    res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };
    next = sinon.spy();
  });

  describe('successResponse middleware', () => {
    beforeEach(() => {
      successResponse(req, res, next);
    });

    test('should add successResponse method to res object', () => {
      expect(typeof res.successResponse).toBe('function');
    });

    test('should add errorResponse method to res object', () => {
      expect(typeof res.errorResponse).toBe('function');
    });

    test('should format success response correctly', () => {
      const testData = { test: 'data' };
      res.successResponse(testData);
      
      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        data: testData
      })).toBe(true);
    });

    test('should handle null data in success response', () => {
      res.successResponse(null);
      
      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        data: null
      })).toBe(true);
    });

    test('should allow custom status code in success response', () => {
      res.successResponse({ test: 'data' }, 201);
      expect(res.status.calledWith(201)).toBe(true);
    });
  });

  describe('errorResponse method', () => {
    beforeEach(() => {
      successResponse(req, res, next);
    });

    test('should format error response correctly', () => {
      res.errorResponse('Test error');
      
      expect(res.status.calledWith(500)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        error: {
          message: 'Test error',
          code: 500
        }
      })).toBe(true);
    });

    test('should handle custom status code in error response', () => {
      res.errorResponse('Not found', 404);
      
      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        error: {
          message: 'Not found',
          code: 404
        }
      })).toBe(true);
    });

    test('should include error details when provided', () => {
      const details = { field: 'username', issue: 'required' };
      res.errorResponse('Validation error', 400, details);
      
      expect(res.status.calledWith(400)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        error: {
          message: 'Validation error',
          code: 400,
          details: details
        }
      })).toBe(true);
    });
  });

  describe('errorHandler middleware', () => {
    test('should handle ValidationError correctly', () => {
      const err = new Error('Validation failed');
      err.name = 'ValidationError';
      err.errors = { field: 'Invalid value' };
      
      errorHandler(err, req, res, next);
      
      expect(res.status.calledWith(400)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        error: {
          message: 'Validation failed',
          code: 400,
          details: { field: 'Invalid value' }
        }
      })).toBe(true);
    });

    test('should handle UnauthorizedError correctly', () => {
      const err = new Error('Unauthorized');
      err.name = 'UnauthorizedError';
      
      errorHandler(err, req, res, next);
      
      expect(res.status.calledWith(401)).toBe(true);
    });

    test('should handle NotFoundError correctly', () => {
      const err = new Error('Not found');
      err.name = 'NotFoundError';
      
      errorHandler(err, req, res, next);
      
      expect(res.status.calledWith(404)).toBe(true);
    });

    test('should handle generic errors with 500 status code', () => {
      const err = new Error('Internal error');
      
      errorHandler(err, req, res, next);
      
      expect(res.status.calledWith(500)).toBe(true);
    });
  });
}); 