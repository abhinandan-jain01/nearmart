import { Product } from '../models/index.js';
import { logger } from '../utils/logger.js';

class ProductService {
  // Create a new product
  async createProduct(retailerId, productData) {
    try {
      const product = await Product.create({
        ...productData,
        retailerId
      });
      return product;
    } catch (error) {
      logger.error('Error creating product:', error);
      throw error;
    }
  }

  // Get all products with optional filters
  async getProducts(filters = {}) {
    try {
      const {
        category,
        subCategory,
        minPrice,
        maxPrice,
        retailerId,
        search,
        page = 1,
        limit = 10
      } = filters;

      const query = {};
      if (category) query.category = category;
      if (subCategory) query.subCategory = subCategory;
      if (retailerId) query.retailerId = retailerId;
      if (minPrice || maxPrice) {
        query.price = {};
        if (minPrice) query.price.$gte = minPrice;
        if (maxPrice) query.price.$lte = maxPrice;
      }
      if (search) {
        query.$or = [
          { name: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } }
        ];
      }

      const skip = (page - 1) * limit;
      const [products, total] = await Promise.all([
        Product.find(query)
          .skip(skip)
          .limit(limit)
          .populate('retailerId', 'businessName')
          .lean(),
        Product.countDocuments(query)
      ]);

      return {
        products,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit)
      };
    } catch (error) {
      logger.error('Error getting products:', error);
      throw error;
    }
  }

  // Get a single product by ID
  async getProductById(productId) {
    try {
      const product = await Product.findByPk(productId, {
        include: [{
          association: 'retailer',
          attributes: ['businessName', 'email']
        }]
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    } catch (error) {
      logger.error('Error fetching product:', error);
      throw error;
    }
  }

  // Update a product
  async updateProduct(productId, retailerId, updateData) {
    try {
      const product = await Product.findOne({
        where: { id: productId, retailerId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      await product.update(updateData);
      return product;
    } catch (error) {
      logger.error('Error updating product:', error);
      throw error;
    }
  }

  // Delete a product
  async deleteProduct(productId, retailerId) {
    try {
      const product = await Product.findOne({
        where: { id: productId, retailerId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      await product.destroy();
      return true;
    } catch (error) {
      logger.error('Error deleting product:', error);
      throw error;
    }
  }

  // Update product stock
  async updateStock(productId, retailerId, quantity, operation = 'add') {
    try {
      const product = await Product.findOne({
        where: { id: productId, retailerId }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const currentStock = product.stock;
      const newStock = operation === 'add' 
        ? currentStock + quantity 
        : currentStock - quantity;

      if (newStock < 0) {
        throw new Error('Insufficient stock');
      }

      await product.update({ stock: newStock });
      return product;
    } catch (error) {
      logger.error('Error updating product stock:', error);
      throw error;
    }
  }

  // Get products by category
  async getProductsByCategory(category, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Product.findAndCountAll({
        where: { category },
        include: [{
          association: 'retailer',
          attributes: ['businessName', 'email']
        }],
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        products: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error fetching products by category:', error);
      throw error;
    }
  }

  // Get retailer's products
  async getRetailerProducts(retailerId, page = 1, limit = 10) {
    try {
      const offset = (page - 1) * limit;
      const { count, rows } = await Product.findAndCountAll({
        where: { retailerId },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });

      return {
        products: rows,
        total: count,
        page,
        totalPages: Math.ceil(count / limit)
      };
    } catch (error) {
      logger.error('Error fetching retailer products:', error);
      throw error;
    }
  }
}

export default new ProductService(); 