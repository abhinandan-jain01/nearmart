import sinon from 'sinon';
import cartController from '../../controllers/cart.controller.js';
import cartService from '../../services/cart.service.js';

describe('Cart Controller', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      user: { id: 'test-user-id' },
      params: { productId: 'test-product-id' },
      body: {
        quantity: 2
      }
    };
    res = {
      json: sinon.spy(),
      status: sinon.stub().returnsThis()
    };
    next = sinon.spy();
  });

  describe('getCart', () => {
    beforeEach(() => {
      sinon.stub(cartService, 'getCart').resolves({
        items: [{ productId: 'test-product-id', quantity: 2 }]
      });
      sinon.stub(cartService, 'getCartTotal').resolves(200);
    });

    afterEach(() => {
      cartService.getCart.restore();
      cartService.getCartTotal.restore();
    });

    test('should return success response with cart and total', async () => {
      await cartController.getCart(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Cart retrieved successfully',
        data: {
          cart: {
            items: [{ productId: 'test-product-id', quantity: 2 }]
          },
          total: 200
        }
      })).toBe(true);
    });

    test('should handle customer not found error', async () => {
      cartService.getCart.rejects(new Error('Customer not found'));

      await cartController.getCart(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Customer not found'
      })).toBe(true);
    });
  });

  describe('addItem', () => {
    beforeEach(() => {
      sinon.stub(cartService, 'addItem').resolves({
        items: [{ productId: 'test-product-id', quantity: 2 }]
      });
      sinon.stub(cartService, 'getCartTotal').resolves(200);
    });

    afterEach(() => {
      cartService.addItem.restore();
      cartService.getCartTotal.restore();
    });

    test('should return success response with updated cart and total', async () => {
      await cartController.addItem(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Item added to cart successfully',
        data: {
          cart: {
            items: [{ productId: 'test-product-id', quantity: 2 }]
          },
          total: 200
        }
      })).toBe(true);
    });

    test('should handle product not found error', async () => {
      cartService.addItem.rejects(new Error('Product not found'));

      await cartController.addItem(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Product not found'
      })).toBe(true);
    });

    test('should handle insufficient stock error', async () => {
      cartService.addItem.rejects(new Error('Insufficient stock'));

      await cartController.addItem(req, res);

      expect(res.status.calledWith(400)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Insufficient stock'
      })).toBe(true);
    });
  });

  describe('updateItemQuantity', () => {
    beforeEach(() => {
      sinon.stub(cartService, 'updateItemQuantity').resolves({
        items: [{ productId: 'test-product-id', quantity: 3 }]
      });
      sinon.stub(cartService, 'getCartTotal').resolves(300);
    });

    afterEach(() => {
      cartService.updateItemQuantity.restore();
      cartService.getCartTotal.restore();
    });

    test('should return success response with updated cart and total', async () => {
      await cartController.updateItemQuantity(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Cart item updated successfully',
        data: {
          cart: {
            items: [{ productId: 'test-product-id', quantity: 3 }]
          },
          total: 300
        }
      })).toBe(true);
    });

    test('should handle item not found error', async () => {
      cartService.updateItemQuantity.rejects(new Error('Item not found in cart'));

      await cartController.updateItemQuantity(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Item not found in cart'
      })).toBe(true);
    });
  });

  describe('removeItem', () => {
    beforeEach(() => {
      sinon.stub(cartService, 'removeItem').resolves({
        items: []
      });
      sinon.stub(cartService, 'getCartTotal').resolves(0);
    });

    afterEach(() => {
      cartService.removeItem.restore();
      cartService.getCartTotal.restore();
    });

    test('should return success response with updated cart and total', async () => {
      await cartController.removeItem(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Item removed from cart successfully',
        data: {
          cart: {
            items: []
          },
          total: 0
        }
      })).toBe(true);
    });

    test('should handle item not found error', async () => {
      cartService.removeItem.rejects(new Error('Item not found in cart'));

      await cartController.removeItem(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Item not found in cart'
      })).toBe(true);
    });
  });

  describe('clearCart', () => {
    beforeEach(() => {
      sinon.stub(cartService, 'clearCart').resolves();
    });

    afterEach(() => {
      cartService.clearCart.restore();
    });

    test('should return success response', async () => {
      await cartController.clearCart(req, res);

      expect(res.status.calledWith(200)).toBe(true);
      expect(res.json.calledWith({
        success: true,
        message: 'Cart cleared successfully'
      })).toBe(true);
    });

    test('should handle customer not found error', async () => {
      cartService.clearCart.rejects(new Error('Customer not found'));

      await cartController.clearCart(req, res);

      expect(res.status.calledWith(404)).toBe(true);
      expect(res.json.calledWith({
        success: false,
        message: 'Customer not found'
      })).toBe(true);
    });
  });
}); 