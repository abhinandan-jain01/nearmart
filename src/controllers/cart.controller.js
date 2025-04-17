import cartService from '../services/cart.service.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';

const getCart = async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user.id);
    const total = await cartService.getCartTotal(req.user.id);
    return successResponse(res, 200, 'Cart retrieved successfully', { cart, total });
  } catch (error) {
    logger.error('Error in getCart controller:', error);
    if (error.message === 'Customer not found') {
      return errorResponse(res, 404, 'Customer not found');
    } else {
      return errorResponse(res, 500, 'Error retrieving cart', error.message);
    }
  }
};

const addItem = async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const cart = await cartService.addItem(req.user.id, productId, quantity);
    const total = await cartService.getCartTotal(req.user.id);
    return successResponse(res, 200, 'Item added to cart successfully', { cart, total });
  } catch (error) {
    logger.error('Error in addItem controller:', error);
    switch (error.message) {
      case 'Customer not found':
        return errorResponse(res, 404, 'Customer not found');
      case 'Product not found':
        return errorResponse(res, 404, 'Product not found');
      case 'Product is not available':
        return errorResponse(res, 400, 'Product is not available');
      case 'Insufficient stock':
        return errorResponse(res, 400, 'Insufficient stock');
      default:
        return errorResponse(res, 500, 'Error adding item to cart', error.message);
    }
  }
};

const updateItemQuantity = async (req, res) => {
  try {
    const { productId } = req.params;
    const { quantity } = req.body;
    const cart = await cartService.updateItemQuantity(req.user.id, productId, quantity);
    const total = await cartService.getCartTotal(req.user.id);
    return successResponse(res, 200, 'Cart item updated successfully', { cart, total });
  } catch (error) {
    logger.error('Error in updateItemQuantity controller:', error);
    switch (error.message) {
      case 'Customer not found':
        return errorResponse(res, 404, 'Customer not found');
      case 'Product not found':
        return errorResponse(res, 404, 'Product not found');
      case 'Product is not available':
        return errorResponse(res, 400, 'Product is not available');
      case 'Item not found in cart':
        return errorResponse(res, 404, 'Item not found in cart');
      case 'Insufficient stock':
        return errorResponse(res, 400, 'Insufficient stock');
      default:
        return errorResponse(res, 500, 'Error updating cart item', error.message);
    }
  }
};

const removeItem = async (req, res) => {
  try {
    const { productId } = req.params;
    const cart = await cartService.removeItem(req.user.id, productId);
    const total = await cartService.getCartTotal(req.user.id);
    return successResponse(res, 200, 'Item removed from cart successfully', { cart, total });
  } catch (error) {
    logger.error('Error in removeItem controller:', error);
    switch (error.message) {
      case 'Customer not found':
        return errorResponse(res, 404, 'Customer not found');
      case 'Item not found in cart':
        return errorResponse(res, 404, 'Item not found in cart');
      default:
        return errorResponse(res, 500, 'Error removing item from cart', error.message);
    }
  }
};

const clearCart = async (req, res) => {
  try {
    await cartService.clearCart(req.user.id);
    return successResponse(res, 200, 'Cart cleared successfully');
  } catch (error) {
    logger.error('Error in clearCart controller:', error);
    if (error.message === 'Customer not found') {
      return errorResponse(res, 404, 'Customer not found');
    } else {
      return errorResponse(res, 500, 'Error clearing cart', error.message);
    }
  }
};

export default {
  getCart,
  addItem,
  updateItemQuantity,
  removeItem,
  clearCart
}; 