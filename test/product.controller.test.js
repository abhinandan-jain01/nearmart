import sinon from 'sinon';
import productController from '../../controllers/product.controller.js';
import productService from '../../services/product.service.js';

describe('Product Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'test-user-id' },
      params: { id: 'test-product-id' },
      body: {
        name: 'Test Product',
        description: 'Test Description',
        price: 100,
        stock: 10,
        category: 'Test Category',
        image: 'test-image.jpg'
      }
    };
    res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };
    next = sinon.spy();
  });

  describe('createProduct', () => {
    beforeEach(() => {
      sinon.stub(productService, 'createProduct').resolves({
        _id: 'test-product-id',
        ...req.body
      });
    });

    afterEach(() => {
      productService.createProduct.restore();
    });

    test('should return success response with created product', async () => {
      await productController.createProduct(req, res);

      expect(res.status.calledWith(201)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Product created successfully',
        data: {
          _id: 'test-product-id',
          ...req.body
        }
      })).toBe(true);
    });

    test('should handle errors and return error response', async () => {
      productService.createProduct.rejects(new Error('Test error'));

      await productController.createProduct(req, res);

      expect(res.status.calledWith(500)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Failed to create product',
        error: 'Test error'
      })).toBe(true);
    });
  });

  describe('getProduct', () => {
    beforeEach(() => {
      sinon.stub(productService, 'getProductById').resolves({
        _id: 'test-product-id',
        name: 'Test Product'
      });
    });

    afterEach(() => {
      productService.getProductById.restore();
    });

    test('should return success response with product', async () => {
      await productController.getProduct(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Product retrieved successfully',
        data: {
          _id: 'test-product-id',
          name: 'Test Product'
        }
      })).toBe(true);
    });

    test('should handle not found error', async () => {
      productService.getProductById.rejects(new Error('Product not found'));

      await productController.getProduct(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Product not found'
      })).toBe(true);
    });
  });

  describe('updateProduct', () => {
    beforeEach(() => {
      sinon.stub(productService, 'updateProduct').resolves({
        _id: 'test-product-id',
        ...req.body
      });
    });

    afterEach(() => {
      productService.updateProduct.restore();
    });

    test('should return success response with updated product', async () => {
      await productController.updateProduct(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Product updated successfully',
        data: {
          _id: 'test-product-id',
          ...req.body
        }
      })).toBe(true);
    });

    test('should handle not found error', async () => {
      productService.updateProduct.rejects(new Error('Product not found'));

      await productController.updateProduct(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Product not found'
      })).toBe(true);
    });
  });

  describe('deleteProduct', () => {
    beforeEach(() => {
      sinon.stub(productService, 'deleteProduct').resolves();
    });

    afterEach(() => {
      productService.deleteProduct.restore();
    });

    test('should return success response', async () => {
      await productController.deleteProduct(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Product deleted successfully'
      })).toBe(true);
    });

    test('should handle not found error', async () => {
      productService.deleteProduct.rejects(new Error('Product not found'));

      await productController.deleteProduct(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Product not found'
      })).toBe(true);
    });
  });
}); 