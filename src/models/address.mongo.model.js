const mongoose = require('mongoose');

const addressSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  addressLine1: {
    type: String,
    required: true
  },
  addressLine2: {
    type: String
  },
  city: {
    type: String,
    required: true
  },
  state: {
    type: String,
    required: true
  },
  postalCode: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  isDefault: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create compound index for userId and isDefault to ensure only one default address per user
addressSchema.index({ userId: 1, isDefault: 1 }, { unique: true, sparse: true });

const Address = mongoose.model('Address', addressSchema);

module.exports = Address; 