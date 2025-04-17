import { Client } from '@googlemaps/google-maps-services-js';
import CustomerLocation from '../models/location/customer.location.model.js';
import RetailerLocation from '../models/location/retailer.location.model.js';
import { logger } from '../utils/logger.js';

if (!process.env.GOOGLE_MAPS_API_KEY) {
  logger.warn('Google Maps API key not found. Some location features may not work properly.');
}

const googleMapsClient = new Client({});

class LocationService {
  // Geocode an address using Google Maps API
  async geocodeAddress(address) {
    try {
      if (!process.env.GOOGLE_MAPS_API_KEY) {
        throw new Error('Google Maps API key is required');
      }

      const response = await googleMapsClient.geocode({
        params: {
          address: address,
          key: process.env.GOOGLE_MAPS_API_KEY
        }
      });

      if (response.data.results.length === 0) {
        throw new Error('No results found for the address');
      }

      const location = response.data.results[0];
      return {
        formattedAddress: location.formatted_address,
        coordinates: {
          lng: location.geometry.location.lng,
          lat: location.geometry.location.lat
        },
        addressComponents: location.address_components
      };
    } catch (error) {
      logger.error('Geocoding error:', error);
      throw new Error('Failed to geocode address');
    }
  }

  // Add a new customer location
  async addCustomerLocation(customerId, addressData) {
    try {
      const geocodedAddress = await this.geocodeAddress(
        `${addressData.street}, ${addressData.city}, ${addressData.state} ${addressData.postalCode}`
      );

      const location = new CustomerLocation({
        customerId,
        address: {
          ...addressData,
          formattedAddress: geocodedAddress.formattedAddress
        },
        location: {
          type: 'Point',
          coordinates: [geocodedAddress.coordinates.lng, geocodedAddress.coordinates.lat]
        }
      });

      await location.save();
      return location;
    } catch (error) {
      logger.error('Error adding customer location:', error);
      throw error;
    }
  }

  // Add a new retailer location
  async addRetailerLocation(retailerId, locationData) {
    try {
      const geocodedAddress = await this.geocodeAddress(
        `${locationData.address.street}, ${locationData.address.city}, ${locationData.address.state} ${locationData.address.postalCode}`
      );

      const location = new RetailerLocation({
        retailerId,
        ...locationData,
        address: {
          ...locationData.address,
          formattedAddress: geocodedAddress.formattedAddress
        },
        location: {
          type: 'Point',
          coordinates: [geocodedAddress.coordinates.lng, geocodedAddress.coordinates.lat]
        }
      });

      await location.save();
      return location;
    } catch (error) {
      logger.error('Error adding retailer location:', error);
      throw error;
    }
  }

  // Calculate distance between two points in meters
  calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371e3; // Earth's radius in meters
    const φ1 = lat1 * Math.PI/180;
    const φ2 = lat2 * Math.PI/180;
    const Δφ = (lat2-lat1) * Math.PI/180;
    const Δλ = (lon2-lon1) * Math.PI/180;

    const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ/2) * Math.sin(Δλ/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

    return R * c;
  }

  // Find nearby retailers with enhanced filtering
  async findNearbyRetailers(coordinates, options = {}) {
    try {
      const {
        maxDistance = 10000, // Default 10km
        category = null,
        onlyOpen = false,
        limit = 20,
        sortBy = 'distance' // distance or rating
      } = options;

      // Validate coordinates
      if (!Array.isArray(coordinates) || coordinates.length !== 2) {
        throw new Error('Invalid coordinates format');
      }

      const [lng, lat] = coordinates;
      if (typeof lng !== 'number' || typeof lat !== 'number' ||
          lng < -180 || lng > 180 || lat < -90 || lat > 90) {
        throw new Error('Invalid coordinates values');
      }

      // Build query
      const query = {
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lng, lat]
            },
            $maxDistance: maxDistance
          }
        },
        isActive: true
      };

      // Add category filter if specified
      if (category) {
        query.businessCategory = category;
      }

      // Find retailers
      let retailers = await RetailerLocation.find(query)
        .populate('retailerId', 'businessName email phone rating')
        .limit(limit);

      // Process results
      retailers = retailers.map(retailer => {
        const distance = this.calculateDistance(
          lat,
          lng,
          retailer.location.coordinates[1],
          retailer.location.coordinates[0]
        );

        const isOpen = retailer.isCurrentlyOpen();

        return {
          ...retailer.toObject(),
          distance: Math.round(distance),
          isOpen,
          nextOpeningTime: !isOpen ? this.getNextOpeningTime(retailer) : null
        };
      });

      // Sort results
      if (sortBy === 'distance') {
        retailers.sort((a, b) => a.distance - b.distance);
      } else if (sortBy === 'rating') {
        retailers.sort((a, b) => (b.retailerId.rating || 0) - (a.retailerId.rating || 0));
      }

      // Filter by open status if requested
      if (onlyOpen) {
        retailers = retailers.filter(retailer => retailer.isOpen);
      }

      return retailers;
    } catch (error) {
      logger.error('Error finding nearby retailers:', error);
      throw error;
    }
  }

  // Get next opening time for a retailer
  getNextOpeningTime(retailer) {
    const now = new Date();
    const currentDay = now.getDay();
    const currentTime = now.toTimeString().slice(0, 5);
    
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    
    // Check next 7 days
    for (let i = 0; i < 7; i++) {
      const dayIndex = (currentDay + i) % 7;
      const day = days[dayIndex];
      const hours = retailer.operatingHours[day];
      
      if (hours && hours.isOpen) {
        // If it's today and before opening time
        if (i === 0 && currentTime < hours.open) {
          return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            time: hours.open
          };
        }
        // If it's a future day
        if (i > 0) {
          return {
            day: day.charAt(0).toUpperCase() + day.slice(1),
            time: hours.open
          };
        }
      }
    }
    
    return null;
  }

  // Get customer's saved locations
  async getCustomerLocations(customerId) {
    try {
      return await CustomerLocation.find({ customerId });
    } catch (error) {
      logger.error('Error fetching customer locations:', error);
      throw error;
    }
  }

  // Get retailer's locations
  async getRetailerLocations(retailerId) {
    try {
      return await RetailerLocation.find({ retailerId });
    } catch (error) {
      logger.error('Error fetching retailer locations:', error);
      throw error;
    }
  }

  // Update a location
  async updateLocation(locationId, updateData, type = 'customer') {
    try {
      const Model = type === 'customer' ? CustomerLocation : RetailerLocation;
      const location = await Model.findById(locationId);

      if (!location) {
        throw new Error('Location not found');
      }

      if (updateData.address) {
        const geocodedAddress = await this.geocodeAddress(
          `${updateData.address.street}, ${updateData.address.city}, ${updateData.address.state} ${updateData.address.postalCode}`
        );

        updateData.address.formattedAddress = geocodedAddress.formattedAddress;
        updateData.location = {
          type: 'Point',
          coordinates: [geocodedAddress.coordinates.lng, geocodedAddress.coordinates.lat]
        };
      }

      Object.assign(location, updateData);
      await location.save();

      return location;
    } catch (error) {
      logger.error('Error updating location:', error);
      throw error;
    }
  }

  // Delete a location
  async deleteLocation(locationId, type = 'customer') {
    try {
      const Model = type === 'customer' ? CustomerLocation : RetailerLocation;
      const location = await Model.findByIdAndDelete(locationId);
      return location;
    } catch (error) {
      logger.error('Error deleting location:', error);
      throw error;
    }
  }
}

export default new LocationService(); 