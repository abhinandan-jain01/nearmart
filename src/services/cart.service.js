import { Cart, Product, Customer } from '../models/index.js';
import { logger } from '../utils/logger.js';

class CartService {
  async getCart(userId) {
    try {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      let cart = await Cart.findOne({ customerId: customer._id });
      if (!cart) {
        cart = await Cart.create({ customerId: customer._id, items: [] });
      }
      return cart;
    } catch (error) {
      logger.error('Error getting cart:', error);
      throw error;
    }
  }

  async addItem(userId, productId, quantity = 1) {
    try {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const cart = await this.getCart(userId);
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.isActive) {
        throw new Error('Product is not available');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const existingItem = cart.items.find(item => item.productId.toString() === productId);
      if (existingItem) {
        const newQuantity = existingItem.quantity + quantity;
        if (product.stock < newQuantity) {
          throw new Error('Insufficient stock');
        }
        existingItem.quantity = newQuantity;
      } else {
        cart.items.push({
          productId,
          quantity,
          price: product.price,
          name: product.name,
          image: product.images?.[0]
        });
      }

      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error adding item to cart:', error);
      throw error;
    }
  }

  async updateItemQuantity(userId, productId, quantity) {
    try {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const cart = await this.getCart(userId);
      const product = await Product.findById(productId);
      
      if (!product) {
        throw new Error('Product not found');
      }

      if (!product.isActive) {
        throw new Error('Product is not available');
      }

      if (product.stock < quantity) {
        throw new Error('Insufficient stock');
      }

      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      if (quantity <= 0) {
        cart.items.splice(itemIndex, 1);
      } else {
        cart.items[itemIndex].quantity = quantity;
      }

      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error updating cart item:', error);
      throw error;
    }
  }

  async removeItem(userId, productId) {
    try {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const cart = await this.getCart(userId);
      const itemIndex = cart.items.findIndex(item => item.productId.toString() === productId);
      
      if (itemIndex === -1) {
        throw new Error('Item not found in cart');
      }

      cart.items.splice(itemIndex, 1);
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error removing item from cart:', error);
      throw error;
    }
  }

  async clearCart(userId) {
    try {
      const customer = await Customer.findOne({ userId });
      if (!customer) {
        throw new Error('Customer not found');
      }

      const cart = await this.getCart(userId);
      cart.items = [];
      await cart.save();
      return cart;
    } catch (error) {
      logger.error('Error clearing cart:', error);
      throw error;
    }
  }

  async getCartTotal(userId) {
    try {
      const cart = await this.getCart(userId);
      const total = cart.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      return { total };
    } catch (error) {
      logger.error('Error calculating cart total:', error);
      throw error;
    }
  }
}

const cartService = new CartService();
export default cartService; 