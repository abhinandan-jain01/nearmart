import { logger } from '../utils/logger.js';
import locationService from '../services/location.service.js';

// Customer location controllers
export const addCustomerLocation = async (req, res) => {
  try {
    const location = await locationService.addCustomerLocation(req.user.id, req.body);
    res.success('Location added successfully', location);
  } catch (error) {
    logger.error('Error adding customer location:', error);
    res.error('Failed to add location', error.message);
  }
};

export const getCustomerLocations = async (req, res) => {
  try {
    const locations = await locationService.getCustomerLocations(req.user.id);
    res.success('Customer locations retrieved', locations);
  } catch (error) {
    logger.error('Error getting customer locations:', error);
    res.error('Failed to get locations', error.message);
  }
};

export const updateCustomerLocation = async (req, res) => {
  try {
    const location = await locationService.updateLocation(req.params.locationId, req.body, 'customer');
    res.success('Location updated successfully', location);
  } catch (error) {
    logger.error('Error updating customer location:', error);
    res.error('Failed to update location', error.message);
  }
};

export const deleteCustomerLocation = async (req, res) => {
  try {
    await locationService.deleteLocation(req.params.locationId, 'customer');
    res.success('Location deleted successfully');
  } catch (error) {
    logger.error('Error deleting customer location:', error);
    res.error('Failed to delete location', error.message);
  }
};

// Retailer location controllers
export const addRetailerLocation = async (req, res) => {
  try {
    const location = await locationService.addRetailerLocation(req.user.id, req.body);
    res.success('Location added successfully', location);
  } catch (error) {
    logger.error('Error adding retailer location:', error);
    res.error('Failed to add location', error.message);
  }
};

export const getRetailerLocations = async (req, res) => {
  try {
    const locations = await locationService.getRetailerLocations(req.user.id);
    res.success('Retailer locations retrieved', locations);
  } catch (error) {
    logger.error('Error getting retailer locations:', error);
    res.error('Failed to get locations', error.message);
  }
};

export const updateRetailerLocation = async (req, res) => {
  try {
    const location = await locationService.updateLocation(req.params.locationId, req.body, 'retailer');
    res.success('Location updated successfully', location);
  } catch (error) {
    logger.error('Error updating retailer location:', error);
    res.error('Failed to update location', error.message);
  }
};

export const deleteRetailerLocation = async (req, res) => {
  try {
    await locationService.deleteLocation(req.params.locationId, 'retailer');
    res.success('Location deleted successfully');
  } catch (error) {
    logger.error('Error deleting retailer location:', error);
    res.error('Failed to delete location', error.message);
  }
};

// Common controllers
export const findNearbyRetailers = async (req, res) => {
  try {
    const { lat, lng, category, onlyOpen, limit, sortBy } = req.query;
    
    if (!lat || !lng) {
      return res.error('Invalid request', 'Latitude and longitude are required', 400);
    }

    const coordinates = [parseFloat(lng), parseFloat(lat)];
    const options = {
      category: category || null,
      onlyOpen: onlyOpen === 'true',
      limit: parseInt(limit) || 20,
      sortBy: sortBy || 'distance'
    };

    const retailers = await locationService.findNearbyRetailers(coordinates, options);
    res.success('Nearby retailers retrieved', retailers);
  } catch (error) {
    logger.error('Error finding nearby retailers:', error);
    res.error('Failed to find nearby retailers', error.message);
  }
};

export const getBusinessCategories = async (req, res) => {
  try {
    const categories = [
      'grocery',
      'restaurant',
      'pharmacy',
      'electronics',
      'clothing',
      'stationery',
      'bakery',
      'other'
    ];
    res.success('Business categories retrieved', categories);
  } catch (error) {
    logger.error('Error getting business categories:', error);
    res.error('Failed to get categories', error.message);
  }
}; 