const addressService = require('../services/address.service');
const { logger } = require('../utils/logger');

class AddressController {
  async createAddress(req, res) {
    try {
      const userId = req.user.id;
      const address = await addressService.createAddress(userId, req.body);
      res.status(201).json(address);
    } catch (error) {
      logger.error('Error in createAddress controller:', error);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async getAddresses(req, res) {
    try {
      const userId = req.user.id;
      const addresses = await addressService.getAddresses(userId);
      res.json(addresses);
    } catch (error) {
      logger.error('Error in getAddresses controller:', error);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async getAddressById(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const address = await addressService.getAddressById(userId, addressId);
      res.json(address);
    } catch (error) {
      logger.error('Error in getAddressById controller:', error);
      res.status(error.message === 'Address not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async updateAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const address = await addressService.updateAddress(userId, addressId, req.body);
      res.json(address);
    } catch (error) {
      logger.error('Error in updateAddress controller:', error);
      res.status(error.message === 'Address not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async deleteAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const address = await addressService.deleteAddress(userId, addressId);
      res.json({ message: 'Address deleted successfully', address });
    } catch (error) {
      logger.error('Error in deleteAddress controller:', error);
      res.status(error.message === 'Address not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async setDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const { addressId } = req.params;
      const address = await addressService.setDefaultAddress(userId, addressId);
      res.json(address);
    } catch (error) {
      logger.error('Error in setDefaultAddress controller:', error);
      res.status(error.message === 'Address not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }

  async getDefaultAddress(req, res) {
    try {
      const userId = req.user.id;
      const address = await addressService.getDefaultAddress(userId);
      res.json(address);
    } catch (error) {
      logger.error('Error in getDefaultAddress controller:', error);
      res.status(error.message === 'User not found' ? 404 : 500).json({
        error: error.message
      });
    }
  }
}

module.exports = new AddressController(); 