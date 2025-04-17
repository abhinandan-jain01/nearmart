import { Retailer, Product } from '../models/index.js';
import { generateToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import bcrypt from 'bcryptjs';
import { Review } from '../models/review.model.js';
import { Order } from '../models/order.model.js';

const retailerController = {
  // Register a new retailer
  async register(req, res) {
    try {
      const {
        email,
        password,
        businessName,
        phone,
        businessType,
        taxId,
        address
      } = req.body;

      // Check if retailer already exists
      const existingRetailer = await Retailer.findOne({ email });
      if (existingRetailer) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new retailer
      const retailer = new Retailer({
        email,
        password,
        businessName,
        phone,
        businessType,
        taxId,
        address
      });

      await retailer.save();

      // Generate token
      const token = generateToken({ id: retailer._id, role: 'retailer' });

      res.status(201).json({
        message: 'Registration successful',
        token,
        retailer: {
          id: retailer._id,
          businessName: retailer.businessName,
          email: retailer.email,
          businessType: retailer.businessType,
          isVerified: retailer.isVerified
        }
      });
    } catch (error) {
      logger.error('Retailer registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // Login retailer
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find retailer
      const retailer = await Retailer.findOne({ email });
      if (!retailer) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await bcrypt.compare(password, retailer.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is active
      if (!retailer.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      // Generate token
      const token = generateToken({ id: retailer._id, role: 'retailer' });

      res.json({
        token,
        retailer: {
          id: retailer._id,
          businessName: retailer.businessName,
          email: retailer.email,
          businessType: retailer.businessType,
          isVerified: retailer.isVerified
        }
      });
    } catch (error) {
      logger.error('Retailer login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Get retailer profile
  async getProfile(req, res) {
    try {
      const retailer = await Retailer.findById(req.user.id)
        .select('-password -passwordResetToken -passwordResetExpires')
        .populate('products');

      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      res.json(retailer);
    } catch (error) {
      logger.error('Get retailer profile error:', error);
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  },

  // Update retailer profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = ['businessName', 'phone', 'businessType', 'address'];
      const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      const retailer = await Retailer.findById(req.user.id);
      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      Object.keys(updates).forEach(update => {
        retailer[update] = updates[update];
      });

      await retailer.save();

      res.json({
        message: 'Profile updated successfully',
        retailer: {
          id: retailer._id,
          businessName: retailer.businessName,
          email: retailer.email,
          businessType: retailer.businessType,
          phone: retailer.phone,
          address: retailer.address
        }
      });
    } catch (error) {
      logger.error('Update retailer profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const retailer = await Retailer.findById(req.user.id);

      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Verify current password
      const isMatch = await bcrypt.compare(currentPassword, retailer.password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      retailer.password = await bcrypt.hash(newPassword, 10);
      await retailer.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  },

  // Get retailer dashboard data
  async getDashboard(req, res) {
    try {
      const retailer = await Retailer.findById(req.user.id);
      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Get dashboard statistics
      const stats = {
        totalOrders: retailer.stats.totalOrders,
        totalRevenue: retailer.stats.totalRevenue,
        averageOrderValue: retailer.stats.averageOrderValue,
        customerCount: retailer.stats.customerCount
      };

      res.json(stats);
    } catch (error) {
      logger.error('Get dashboard error:', error);
      res.status(500).json({ message: 'Failed to get dashboard data', error: error.message });
    }
  },

  // Get retailer analytics
  async getAnalytics(req, res) {
    try {
      const { startDate, endDate } = req.query;
      const retailer = await Retailer.findById(req.user.id);

      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Get analytics data
      const analytics = {
        // Add your analytics calculation logic here
        salesByDay: [],
        topProducts: [],
        customerStats: {}
      };

      res.json(analytics);
    } catch (error) {
      logger.error('Get analytics error:', error);
      res.status(500).json({ message: 'Failed to get analytics', error: error.message });
    }
  },

  // Get retailer settings
  async getSettings(req, res) {
    try {
      const retailer = await Retailer.findById(req.user.id)
        .select('storeTimings deliveryAreas features subscription');

      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      res.json({
        storeTimings: retailer.storeTimings,
        deliveryAreas: retailer.deliveryAreas,
        features: retailer.features,
        subscription: retailer.subscription
      });
    } catch (error) {
      logger.error('Get settings error:', error);
      res.status(500).json({ message: 'Failed to get settings', error: error.message });
    }
  },

  // Update retailer settings
  async updateSettings(req, res) {
    try {
      const { storeTimings, deliveryAreas, features } = req.body;
      const retailer = await Retailer.findById(req.user.id);

      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Update settings
      if (storeTimings) retailer.storeTimings = storeTimings;
      if (deliveryAreas) retailer.deliveryAreas = deliveryAreas;
      if (features) retailer.features = features;

      await retailer.save();

      res.json({
        message: 'Settings updated successfully',
        settings: {
          storeTimings: retailer.storeTimings,
          deliveryAreas: retailer.deliveryAreas,
          features: retailer.features
        }
      });
    } catch (error) {
      logger.error('Update settings error:', error);
      res.status(500).json({ message: 'Failed to update settings', error: error.message });
    }
  },

  // Get retailer's products
  getProducts: async (req, res) => {
    try {
      const retailerId = req.user.id;
      const { page = 1, limit = 10, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

      const sortOptions = {
        createdAt: { createdAt: sortOrder === 'desc' ? -1 : 1 },
        price: { price: sortOrder === 'desc' ? -1 : 1 },
        stock: { stock: sortOrder === 'desc' ? -1 : 1 }
      };

      const products = await Product.find({ retailerId })
        .sort(sortOptions[sortBy] || sortOptions.createdAt)
        .skip((page - 1) * limit)
        .limit(parseInt(limit));

      const total = await Product.countDocuments({ retailerId });

      res.json({
        products,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Error in getProducts:', error);
      res.status(500).json({ error: 'Failed to fetch products' });
    }
  },

  // Update product status (active/inactive)
  async updateProductStatus(req, res) {
    try {
      const { productId } = req.params;
      const { isActive } = req.body;

      const retailer = await Retailer.findById(req.user.id);
      if (!retailer) {
        return res.status(404).json({ message: 'Retailer not found' });
      }

      // Check if product belongs to retailer
      if (!retailer.products.includes(productId)) {
        return res.status(403).json({ message: 'Product not found in retailer inventory' });
      }

      // Update product status
      const product = await Product.findByIdAndUpdate(
        productId,
        { isActive },
        { new: true }
      );

      if (!product) {
        return res.status(404).json({ message: 'Product not found' });
      }

      res.json({
        message: 'Product status updated successfully',
        product
      });
    } catch (error) {
      logger.error('Update product status error:', error);
      res.status(500).json({ message: 'Failed to update product status', error: error.message });
    }
  },

  // Search retailers based on various criteria
  searchRetailers: async (req, res) => {
    try {
      const {
        query,
        type,
        location,
        rating,
        sortBy = 'rating',
        page = 1,
        limit = 10
      } = req.query;

      const filter = {};
      
      if (query) {
        filter.$or = [
          { businessName: { $regex: query, $options: 'i' } },
          { description: { $regex: query, $options: 'i' } }
        ];
      }
      
      if (type) {
        filter.businessType = type;
      }
      
      if (location) {
        filter['address.city'] = { $regex: location, $options: 'i' };
      }
      
      if (rating) {
        filter.averageRating = { $gte: parseFloat(rating) };
      }

      const sortOptions = {
        rating: { averageRating: -1 },
        orders: { 'stats.totalOrders': -1 },
        newest: { createdAt: -1 }
      };

      const retailers = await Retailer.find(filter)
        .sort(sortOptions[sortBy] || sortOptions.rating)
        .skip((page - 1) * limit)
        .limit(limit)
        .select('businessName businessType address averageRating totalRatings description images');

      const total = await Retailer.countDocuments(filter);

      res.json({
        retailers,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Error in searchRetailers:', error);
      res.status(500).json({ error: 'Failed to search retailers' });
    }
  },

  // Add a new review for a retailer
  addReview: async (req, res) => {
    try {
      const { retailerId } = req.params;
      const customerId = req.user.id;
      const { rating, comment, images = [] } = req.body;

      // Check if customer has ordered from this retailer
      const hasOrdered = await Order.findOne({
        customerId,
        retailerId,
        status: 'delivered'
      });

      if (!hasOrdered) {
        return res.status(403).json({
          error: 'You can only review retailers you have ordered from'
        });
      }

      // Create the review
      const review = new Review({
        retailerId,
        customerId,
        rating,
        comment,
        images,
        orderIds: [hasOrdered._id]
      });

      await review.save();

      // Update retailer's average rating
      const retailer = await Retailer.findById(retailerId);
      const totalRatings = retailer.totalRatings + 1;
      const averageRating = (retailer.averageRating * retailer.totalRatings + rating) / totalRatings;

      await Retailer.findByIdAndUpdate(retailerId, {
        $set: { averageRating, totalRatings },
        $push: { reviews: review._id }
      });

      res.status(201).json(review);
    } catch (error) {
      logger.error('Error in addReview:', error);
      if (error.code === 11000) {
        res.status(400).json({ error: 'You have already reviewed this retailer' });
      } else {
        res.status(500).json({ error: 'Failed to add review' });
      }
    }
  },

  // Get reviews for a retailer
  getReviews: async (req, res) => {
    try {
      const { retailerId } = req.params;
      const { page = 1, limit = 10, sort = 'recent' } = req.query;

      const sortOptions = {
        recent: { createdAt: -1 },
        rating: { rating: -1 },
        likes: { likes: -1 }
      };

      const reviews = await Review.find({ retailerId, status: 'approved' })
        .sort(sortOptions[sort])
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('customerId', 'name')
        .select('-status');

      const total = await Review.countDocuments({ retailerId, status: 'approved' });

      res.json({
        reviews,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Error in getReviews:', error);
      res.status(500).json({ error: 'Failed to fetch reviews' });
    }
  },

  // Update store timings
  updateStoreTimings: async (req, res) => {
    try {
      const retailerId = req.user.id;
      const { storeTimings } = req.body;

      // Validate store timings
      const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
      const isValid = days.every(day => {
        if (!storeTimings[day]) return true;
        const { open, close } = storeTimings[day];
        return /^([01]\d|2[0-3]):([0-5]\d)$/.test(open) && 
               /^([01]\d|2[0-3]):([0-5]\d)$/.test(close);
      });

      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid time format. Use HH:mm format (24-hour)'
        });
      }

      const retailer = await Retailer.findByIdAndUpdate(
        retailerId,
        { $set: { storeTimings } },
        { new: true }
      );

      res.json(retailer.storeTimings);
    } catch (error) {
      logger.error('Error in updateStoreTimings:', error);
      res.status(500).json({ error: 'Failed to update store timings' });
    }
  },

  // Update delivery areas
  updateDeliveryAreas: async (req, res) => {
    try {
      const retailerId = req.user.id;
      const { deliveryAreas } = req.body;

      // Validate delivery areas
      if (!Array.isArray(deliveryAreas) || !deliveryAreas.length) {
        return res.status(400).json({
          error: 'deliveryAreas must be a non-empty array'
        });
      }

      const isValid = deliveryAreas.every(area => {
        return area.pincode && 
               typeof area.deliveryFee === 'number' &&
               typeof area.minOrderAmount === 'number' &&
               typeof area.estimatedTime === 'number';
      });

      if (!isValid) {
        return res.status(400).json({
          error: 'Invalid delivery area format'
        });
      }

      const retailer = await Retailer.findByIdAndUpdate(
        retailerId,
        { $set: { deliveryAreas } },
        { new: true }
      );

      res.json(retailer.deliveryAreas);
    } catch (error) {
      logger.error('Error in updateDeliveryAreas:', error);
      res.status(500).json({ error: 'Failed to update delivery areas' });
    }
  },

  // Add a new product
  addProduct: async (req, res) => {
    try {
      const retailerId = req.user.id;
      const {
        name,
        description,
        price,
        category,
        stock,
        images = [],
        specifications = {},
        variants = []
      } = req.body;

      // Create new product
      const product = new Product({
        retailerId,
        name,
        description,
        price,
        category,
        stock,
        images,
        specifications,
        variants
      });

      await product.save();

      // Add product to retailer's products array
      await Retailer.findByIdAndUpdate(retailerId, {
        $push: { products: product._id }
      });

      res.status(201).json(product);
    } catch (error) {
      logger.error('Error in addProduct:', error);
      res.status(500).json({ error: 'Failed to add product' });
    }
  },

  // Update an existing product
  updateProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const retailerId = req.user.id;
      const updates = req.body;

      // Check if product exists and belongs to retailer
      const product = await Product.findOne({ _id: productId, retailerId });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Update allowed fields
      const allowedUpdates = [
        'name',
        'description',
        'price',
        'category',
        'stock',
        'images',
        'specifications',
        'variants',
        'isActive'
      ];

      Object.keys(updates).forEach(key => {
        if (allowedUpdates.includes(key)) {
          product[key] = updates[key];
        }
      });

      await product.save();
      res.json(product);
    } catch (error) {
      logger.error('Error in updateProduct:', error);
      res.status(500).json({ error: 'Failed to update product' });
    }
  },

  // Delete a product
  deleteProduct: async (req, res) => {
    try {
      const { productId } = req.params;
      const retailerId = req.user.id;

      // Check if product exists and belongs to retailer
      const product = await Product.findOne({ _id: productId, retailerId });
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      // Remove product from retailer's products array
      await Retailer.findByIdAndUpdate(retailerId, {
        $pull: { products: productId }
      });

      // Delete the product
      await Product.findByIdAndDelete(productId);

      res.json({ message: 'Product deleted successfully' });
    } catch (error) {
      logger.error('Error in deleteProduct:', error);
      res.status(500).json({ error: 'Failed to delete product' });
    }
  },

  // Get retailer's orders
  getOrders: async (req, res) => {
    try {
      const retailerId = req.user.id;
      const { 
        page = 1, 
        limit = 10, 
        status,
        sortBy = 'createdAt',
        sortOrder = 'desc'
      } = req.query;

      const filter = { retailerId };
      if (status) {
        filter.status = status;
      }

      const sortOptions = {
        createdAt: { createdAt: sortOrder === 'desc' ? -1 : 1 },
        total: { total: sortOrder === 'desc' ? -1 : 1 }
      };

      const orders = await Order.find(filter)
        .sort(sortOptions[sortBy] || sortOptions.createdAt)
        .skip((page - 1) * limit)
        .limit(parseInt(limit))
        .populate('customerId', 'name email phone')
        .populate('items.productId', 'name price');

      const total = await Order.countDocuments(filter);

      res.json({
        orders,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Error in getOrders:', error);
      res.status(500).json({ error: 'Failed to fetch orders' });
    }
  },

  // Update order status
  updateOrderStatus: async (req, res) => {
    try {
      const { orderId } = req.params;
      const retailerId = req.user.id;
      const { status } = req.body;

      // Validate status
      const validStatuses = ['pending', 'confirmed', 'processing', 'ready', 'out_for_delivery', 'delivered', 'cancelled'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({ error: 'Invalid order status' });
      }

      // Check if order exists and belongs to retailer
      const order = await Order.findOne({ _id: orderId, retailerId });
      if (!order) {
        return res.status(404).json({ error: 'Order not found' });
      }

      // Update order status
      order.status = status;
      if (status === 'delivered') {
        order.deliveredAt = new Date();
      }

      await order.save();

      // If order is delivered, update retailer stats
      if (status === 'delivered') {
        await Retailer.findByIdAndUpdate(retailerId, {
          $inc: {
            'stats.totalOrders': 1,
            'stats.totalRevenue': order.total,
            'stats.customerCount': 1
          }
        });
      }

      res.json(order);
    } catch (error) {
      logger.error('Error in updateOrderStatus:', error);
      res.status(500).json({ error: 'Failed to update order status' });
    }
  }
};

export default retailerController;