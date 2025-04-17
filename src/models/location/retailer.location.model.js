import mongoose from 'mongoose';

const retailerLocationSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Retailer'
  },
  storeName: {
    type: String,
    required: true
  },
  businessCategory: {
    type: String,
    required: true,
    enum: ['grocery', 'restaurant', 'pharmacy', 'electronics', 'clothing', 'stationery', 'bakery', 'other']
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
  contact: {
    phone: String,
    email: String
  },
  operatingHours: {
    monday: { open: String, close: String, isOpen: Boolean },
    tuesday: { open: String, close: String, isOpen: Boolean },
    wednesday: { open: String, close: String, isOpen: Boolean },
    thursday: { open: String, close: String, isOpen: Boolean },
    friday: { open: String, close: String, isOpen: Boolean },
    saturday: { open: String, close: String, isOpen: Boolean },
    sunday: { open: String, close: String, isOpen: Boolean }
  },
  isActive: {
    type: Boolean,
    default: true
  },
  features: [{
    type: String,
    enum: ['parking', 'wheelchair_accessible', 'delivery', 'pickup', 'wifi']
  }],
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

// Create compound index for retailerId and isActive
retailerLocationSchema.index({ retailerId: 1, isActive: 1 });

// Create geospatial index
retailerLocationSchema.index({ location: '2dsphere' });

// Create index for business category
retailerLocationSchema.index({ businessCategory: 1 });

// Update the updatedAt timestamp before saving
retailerLocationSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add method to check if store is currently open
retailerLocationSchema.methods.isCurrentlyOpen = function() {
  const now = new Date();
  const dayOfWeek = now.getDay(); // 0 = Sunday, 1 = Monday, etc.
  const currentTime = now.toTimeString().slice(0, 5); // HH:MM format
  
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
  const today = days[dayOfWeek];
  
  const hours = this.operatingHours[today];
  if (!hours || !hours.isOpen) return false;
  
  return currentTime >= hours.open && currentTime <= hours.close;
};

const RetailerLocation = mongoose.model('RetailerLocation', retailerLocationSchema);
export default RetailerLocation; 