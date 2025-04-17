import productService from '../services/product.service.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';

const createProduct = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const product = await productService.createProduct(retailerId, req.body);
    return successResponse(res, 201, 'Product created successfully', product);
  } catch (error) {
    logger.error('Error in createProduct controller:', error);
    return errorResponse(res, 500, 'Failed to create product', error.message);
  }
};

const getProducts = async (req, res) => {
  try {
    const filters = {
      category: req.query.category,
      subCategory: req.query.subCategory,
      minPrice: req.query.minPrice,
      maxPrice: req.query.maxPrice,
      retailerId: req.query.retailerId,
      search: req.query.search,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };

    const result = await productService.getProducts(filters);
    return successResponse(res, 200, 'Products retrieved successfully', result);
  } catch (error) {
    logger.error('Error in getProducts controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve products', error.message);
  }
};

const getProduct = async (req, res) => {
  try {
    const product = await productService.getProductById(req.params.id);
    return successResponse(res, 200, 'Product retrieved successfully', product);
  } catch (error) {
    logger.error('Error in getProduct controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    }
    return errorResponse(res, 500, 'Failed to retrieve product', error.message);
  }
};

const updateProduct = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const product = await productService.updateProduct(req.params.id, retailerId, req.body);
    return successResponse(res, 200, 'Product updated successfully', product);
  } catch (error) {
    logger.error('Error in updateProduct controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    }
    return errorResponse(res, 500, 'Failed to update product', error.message);
  }
};

const deleteProduct = async (req, res) => {
  try {
    const retailerId = req.user.id;
    await productService.deleteProduct(req.params.id, retailerId);
    return successResponse(res, 200, 'Product deleted successfully');
  } catch (error) {
    logger.error('Error in deleteProduct controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    }
    return errorResponse(res, 500, 'Failed to delete product', error.message);
  }
};

const getProductsByCategory = async (req, res) => {
  try {
    const { category } = req.params;
    const filters = {
      category,
      page: parseInt(req.query.page) || 1,
      limit: parseInt(req.query.limit) || 10
    };
    const result = await productService.getProducts(filters);
    return successResponse(res, 200, 'Products retrieved successfully', result);
  } catch (error) {
    logger.error('Error in getProductsByCategory controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve products by category', error.message);
  }
};

const updateStock = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const { quantity, operation } = req.body;
    const product = await productService.updateStock(req.params.id, retailerId, quantity, operation);
    return successResponse(res, 200, 'Stock updated successfully', product);
  } catch (error) {
    logger.error('Error in updateStock controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    } else if (error.message === 'Insufficient stock') {
      return errorResponse(res, 400, 'Insufficient stock');
    }
    return errorResponse(res, 500, 'Failed to update stock', error.message);
  }
};

const getRetailerProducts = async (req, res) => {
  try {
    const retailerId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const result = await productService.getRetailerProducts(retailerId, page, limit);
    return successResponse(res, 200, 'Retailer products retrieved successfully', result);
  } catch (error) {
    logger.error('Error in getRetailerProducts controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve retailer products', error.message);
  }
};

// Get products from a specific store
const getStoreProducts = async (req, res) => {
  try {
    const { storeId } = req.params;
    const { page = 1, limit = 10, category, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const filters = {
      retailerId: storeId,
      category,
      page: parseInt(page),
      limit: parseInt(limit),
      sortBy,
      sortOrder
    };

    const result = await productService.getProducts(filters);
    return successResponse(res, 200, 'Store products retrieved successfully', result);
  } catch (error) {
    logger.error('Error in getStoreProducts controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve store products', error.message);
  }
};

// Get products near a location
const getNearbyProducts = async (req, res) => {
  try {
    const { latitude, longitude, radius = 5, category } = req.query;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    if (!latitude || !longitude) {
      return errorResponse(res, 400, 'Latitude and longitude are required');
    }

    const result = await productService.getNearbyProducts(
      parseFloat(latitude),
      parseFloat(longitude),
      parseFloat(radius),
      category,
      page,
      limit
    );
    return successResponse(res, 200, 'Nearby products retrieved successfully', result);
  } catch (error) {
    logger.error('Error in getNearbyProducts controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve nearby products', error.message);
  }
};

// Search products
const searchProducts = async (req, res) => {
  try {
    const {
      query,
      category,
      minPrice,
      maxPrice,
      sortBy = 'relevance',
      sortOrder = 'desc',
      page = 1,
      limit = 10
    } = req.query;

    const filters = {
      search: query,
      category,
      minPrice: minPrice ? parseFloat(minPrice) : undefined,
      maxPrice: maxPrice ? parseFloat(maxPrice) : undefined,
      sortBy,
      sortOrder,
      page: parseInt(page),
      limit: parseInt(limit)
    };

    const result = await productService.searchProducts(filters);
    return successResponse(res, 200, 'Products searched successfully', result);
  } catch (error) {
    logger.error('Error in searchProducts controller:', error);
    return errorResponse(res, 500, 'Failed to search products', error.message);
  }
};

// Get all product categories
const getCategories = async (req, res) => {
  try {
    const categories = await productService.getCategories();
    return successResponse(res, 200, 'Categories retrieved successfully', categories);
  } catch (error) {
    logger.error('Error in getCategories controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve categories', error.message);
  }
};

// Get detailed product information
const getProductDetails = async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await productService.getProductDetails(productId);
    return successResponse(res, 200, 'Product details retrieved successfully', product);
  } catch (error) {
    logger.error('Error in getProductDetails controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    }
    return errorResponse(res, 500, 'Failed to retrieve product details', error.message);
  }
};

// Add a product review
const addReview = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;
    const { rating, comment, images = [] } = req.body;

    const review = await productService.addReview(productId, customerId, {
      rating,
      comment,
      images
    });

    return successResponse(res, 201, 'Review added successfully', review);
  } catch (error) {
    logger.error('Error in addReview controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    } else if (error.message === 'Review already exists') {
      return errorResponse(res, 400, 'You have already reviewed this product');
    }
    return errorResponse(res, 500, 'Failed to add review', error.message);
  }
};

// Get product reviews
const getReviews = async (req, res) => {
  try {
    const { productId } = req.params;
    const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    const reviews = await productService.getProductReviews(
      productId,
      parseInt(page),
      parseInt(limit),
      sortBy,
      sortOrder
    );

    return successResponse(res, 200, 'Reviews retrieved successfully', reviews);
  } catch (error) {
    logger.error('Error in getReviews controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    }
    return errorResponse(res, 500, 'Failed to retrieve reviews', error.message);
  }
};

// Add product to favorites
const addToFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;

    await productService.addToFavorites(productId, customerId);
    return successResponse(res, 200, 'Product added to favorites');
  } catch (error) {
    logger.error('Error in addToFavorites controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    } else if (error.message === 'Already in favorites') {
      return errorResponse(res, 400, 'Product is already in favorites');
    }
    return errorResponse(res, 500, 'Failed to add to favorites', error.message);
  }
};

// Remove product from favorites
const removeFromFavorites = async (req, res) => {
  try {
    const { productId } = req.params;
    const customerId = req.user.id;

    await productService.removeFromFavorites(productId, customerId);
    return successResponse(res, 200, 'Product removed from favorites');
  } catch (error) {
    logger.error('Error in removeFromFavorites controller:', error);
    if (error.message === 'Product not found') {
      return errorResponse(res, 404, 'Product not found');
    } else if (error.message === 'Not in favorites') {
      return errorResponse(res, 400, 'Product is not in favorites');
    }
    return errorResponse(res, 500, 'Failed to remove from favorites', error.message);
  }
};

export default {
  createProduct,
  getProducts,
  getProduct,
  updateProduct,
  deleteProduct,
  getProductsByCategory,
  updateStock,
  getRetailerProducts,
  getStoreProducts,
  getNearbyProducts,
  searchProducts,
  getCategories,
  getProductDetails,
  addReview,
  getReviews,
  addToFavorites,
  removeFromFavorites
}; 