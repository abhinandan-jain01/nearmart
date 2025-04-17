import { Retailer } from '../models/index.js';
import { logger } from '../utils/logger.js';

const storeController = {
  // Get nearby stores based on location
  async getNearbyStores(req, res) {
    try {
      const { latitude, longitude, radius = 10 } = req.query;

      const stores = await Retailer.find({
        'address.location': {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [parseFloat(longitude), parseFloat(latitude)]
            },
            $maxDistance: radius * 1000 // Convert km to meters
          }
        },
        isActive: true
      }).select('-password -passwordResetToken -passwordResetExpires');

      res.json(stores);
    } catch (error) {
      logger.error('Error getting nearby stores:', error);
      res.status(500).json({ message: 'Failed to get nearby stores', error: error.message });
    }
  },

  // Search stores by name, category, etc.
  async searchStores(req, res) {
    try {
      const { query, category, page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const filter = {
        isActive: true,
        ...(query && { $text: { $search: query } }),
        ...(category && { businessType: category })
      };

      const stores = await Retailer.find(filter)
        .select('-password -passwordResetToken -passwordResetExpires')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ averageRating: -1 });

      const total = await Retailer.countDocuments(filter);

      res.json({
        stores,
        page: parseInt(page),
        totalPages: Math.ceil(total / limit),
        total
      });
    } catch (error) {
      logger.error('Error searching stores:', error);
      res.status(500).json({ message: 'Failed to search stores', error: error.message });
    }
  },

  // Get store categories
  async getStoreCategories(req, res) {
    try {
      const categories = await Retailer.distinct('businessType');
      res.json(categories);
    } catch (error) {
      logger.error('Error getting store categories:', error);
      res.status(500).json({ message: 'Failed to get store categories', error: error.message });
    }
  },

  // Get store details
  async getStoreDetails(req, res) {
    try {
      const { storeId } = req.params;

      const store = await Retailer.findById(storeId)
        .select('-password -passwordResetToken -passwordResetExpires')
        .populate('products');

      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      res.json(store);
    } catch (error) {
      logger.error('Error getting store details:', error);
      res.status(500).json({ message: 'Failed to get store details', error: error.message });
    }
  },

  // Add store to favorites
  async addToFavorites(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user.id;

      const store = await Retailer.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // Add to customer's favorite stores (assuming you have this field in Customer model)
      await Customer.findByIdAndUpdate(
        customerId,
        { $addToSet: { favoriteStores: storeId } }
      );

      res.json({ message: 'Store added to favorites' });
    } catch (error) {
      logger.error('Error adding store to favorites:', error);
      res.status(500).json({ message: 'Failed to add store to favorites', error: error.message });
    }
  },

  // Remove store from favorites
  async removeFromFavorites(req, res) {
    try {
      const { storeId } = req.params;
      const customerId = req.user.id;

      await Customer.findByIdAndUpdate(
        customerId,
        { $pull: { favoriteStores: storeId } }
      );

      res.json({ message: 'Store removed from favorites' });
    } catch (error) {
      logger.error('Error removing store from favorites:', error);
      res.status(500).json({ message: 'Failed to remove store from favorites', error: error.message });
    }
  },

  // Add store review
  async addReview(req, res) {
    try {
      const { storeId } = req.params;
      const { rating, comment } = req.body;
      const customerId = req.user.id;

      const store = await Retailer.findById(storeId);
      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      // Add review
      store.reviews.push({
        customerId,
        rating,
        comment,
        createdAt: new Date()
      });

      // Update average rating
      const totalRatings = store.reviews.length;
      const sumRatings = store.reviews.reduce((sum, review) => sum + review.rating, 0);
      store.averageRating = sumRatings / totalRatings;
      store.totalRatings = totalRatings;

      await store.save();

      res.json({ message: 'Review added successfully' });
    } catch (error) {
      logger.error('Error adding store review:', error);
      res.status(500).json({ message: 'Failed to add review', error: error.message });
    }
  },

  // Get store reviews
  async getReviews(req, res) {
    try {
      const { storeId } = req.params;
      const { page = 1, limit = 10 } = req.query;
      const skip = (page - 1) * limit;

      const store = await Retailer.findById(storeId)
        .select('reviews')
        .populate('reviews.customerId', 'firstName lastName');

      if (!store) {
        return res.status(404).json({ message: 'Store not found' });
      }

      const reviews = store.reviews
        .sort((a, b) => b.createdAt - a.createdAt)
        .slice(skip, skip + parseInt(limit));

      res.json({
        reviews,
        page: parseInt(page),
        totalPages: Math.ceil(store.reviews.length / limit),
        total: store.reviews.length
      });
    } catch (error) {
      logger.error('Error getting store reviews:', error);
      res.status(500).json({ message: 'Failed to get reviews', error: error.message });
    }
  }
};

export default storeController; 