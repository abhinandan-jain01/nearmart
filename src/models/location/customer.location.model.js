import mongoose from 'mongoose';

const customerLocationSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Customer'
  },
  address: {
    street: String,
    city: String,
    state: String,
    country: String,
    postalCode: String,
    formattedAddress: String
  },
  location: {
    type: {
      type: String,
      enum: ['Point'],
      default: 'Point'
    },
    coordinates: {
      type: [Number], // [longitude, latitude]
      required: true,
      validate: {
        validator: function(coords) {
          return coords.length === 2 && 
                 typeof coords[0] === 'number' && 
                 typeof coords[1] === 'number' &&
                 coords[0] >= -180 && coords[0] <= 180 &&
                 coords[1] >= -90 && coords[1] <= 90;
        },
        message: 'Invalid coordinates. Must be [longitude, latitude] with valid ranges.'
      }
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  label: {
    type: String,
    enum: ['Home', 'Work', 'Other'],
    default: 'Home'
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

// Create compound index for customerId and isDefault
customerLocationSchema.index({ customerId: 1, isDefault: 1 });

// Create geospatial index
customerLocationSchema.index({ location: '2dsphere' });

// Update the updatedAt timestamp before saving
customerLocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

const CustomerLocation = mongoose.model('CustomerLocation', customerLocationSchema);
export default CustomerLocation; 