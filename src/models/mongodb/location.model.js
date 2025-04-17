const mongoose = require('mongoose');

const locationSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  userType: {
    type: String,
    enum: ['customer', 'retailer'],
    required: true
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String
  },
  coordinates: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number],
      required: true
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create 2dsphere index for geospatial queries
locationSchema.index({ coordinates: '2dsphere' });

// Update the updatedAt timestamp before saving
locationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const Location = mongoose.model('Location', locationSchema);

module.exports = Location; 