import mongoose from 'mongoose';

const storeTimingSchema = new mongoose.Schema({
  day: {
    type: String,
    enum: ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'],
    required: true
  },
  open: {
    type: String,
    required: true
  },
  close: {
    type: String,
    required: true
  },
  isClosed: {
    type: Boolean,
    default: false
  }
});

const deliveryAreaSchema = new mongoose.Schema({
  area: {
    type: String,
    required: true
  },
  deliveryFee: {
    type: Number,
    required: true
  },
  minOrderAmount: {
    type: Number,
    required: true
  },
  estimatedDeliveryTime: {
    type: Number, // in minutes
    required: true
  }
});

const retailerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  businessName: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  businessType: {
    type: String,
    required: true,
    enum: ['grocery', 'electronics', 'clothing', 'pharmacy', 'general']
  },
  taxId: {
    type: String,
    required: true
  },
  address: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  images: [{
    url: String,
    key: String,
    isPrimary: Boolean
  }],
  storeTimings: [storeTimingSchema],
  deliveryAreas: [deliveryAreaSchema],
  deliveryRadius: {
    type: Number, // in kilometers
    required: true
  },
  minOrderAmount: {
    type: Number,
    required: true
  },
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  totalRatings: {
    type: Number,
    default: 0
  },
  reviews: [{
    customerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Customer'
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5
    },
    comment: String,
    images: [{
      url: String,
      key: String
    }],
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  isVerified: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  },
  products: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  subscription: {
    type: {
      type: String,
      enum: ['basic', 'premium', 'enterprise'],
      default: 'basic'
    },
    startDate: Date,
    endDate: Date,
    isActive: Boolean
  },
  features: {
    hasDelivery: {
      type: Boolean,
      default: true
    },
    hasPickup: {
      type: Boolean,
      default: true
    },
    hasExpressDelivery: {
      type: Boolean,
      default: false
    },
    hasSubscription: {
      type: Boolean,
      default: false
    }
  },
  stats: {
    totalOrders: {
      type: Number,
      default: 0
    },
    totalRevenue: {
      type: Number,
      default: 0
    },
    averageOrderValue: {
      type: Number,
      default: 0
    },
    customerCount: {
      type: Number,
      default: 0
    }
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
retailerSchema.index({ businessName: 'text', description: 'text' });
retailerSchema.index({ businessType: 1 });
retailerSchema.index({ averageRating: -1 });
retailerSchema.index({ 'address.location': '2dsphere' });

const Retailer = mongoose.model('Retailer', retailerSchema);
export default Retailer; 