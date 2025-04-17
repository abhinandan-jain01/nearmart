import User from '../models/user.model.js';
import Address from '../models/address.model.js';
import { logger } from '../utils/logger.js';

class AddressService {
  async createAddress(userId, addressData) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Create address
      const address = await Address.create({
        userId: userId,
        ...addressData
      });

      return address;
    } catch (error) {
      logger.error('Error creating address:', error);
      throw error;
    }
  }

  async getAddresses(userId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get addresses
      const addresses = await Address.find({ userId });
      return addresses;
    } catch (error) {
      logger.error('Error fetching addresses:', error);
      throw error;
    }
  }

  async getAddressById(userId, addressId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get address
      const address = await Address.findOne({ _id: addressId, userId });
      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      logger.error('Error fetching address:', error);
      throw error;
    }
  }

  async updateAddress(userId, addressId, addressData) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update address
      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { $set: addressData },
        { new: true }
      );

      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      logger.error('Error updating address:', error);
      throw error;
    }
  }

  async deleteAddress(userId, addressId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Delete address
      const address = await Address.findOneAndDelete({ _id: addressId, userId });
      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      logger.error('Error deleting address:', error);
      throw error;
    }
  }

  async setDefaultAddress(userId, addressId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Update addresses
      await Address.updateMany(
        { userId },
        { $set: { isDefault: false } }
      );

      const address = await Address.findOneAndUpdate(
        { _id: addressId, userId },
        { $set: { isDefault: true } },
        { new: true }
      );

      if (!address) {
        throw new Error('Address not found');
      }

      return address;
    } catch (error) {
      logger.error('Error setting default address:', error);
      throw error;
    }
  }

  async getDefaultAddress(userId) {
    try {
      // Verify user exists
      const user = await User.findById(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Get default address
      const address = await Address.findOne({ userId, isDefault: true });
      return address;
    } catch (error) {
      logger.error('Error fetching default address:', error);
      throw error;
    }
  }
}

export default new AddressService(); 