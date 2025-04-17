import mongoose from 'mongoose';

const analyticsSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Retailer',
    index: true
  },
  date: {
    type: Date,
    required: true,
    index: true
  },
  metrics: {
    // Order metrics
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
    orderStatus: {
      pending: { type: Number, default: 0 },
      accepted: { type: Number, default: 0 },
      processing: { type: Number, default: 0 },
      dispatched: { type: Number, default: 0 },
      delivered: { type: Number, default: 0 },
      cancelled: { type: Number, default: 0 }
    },
    
    // Customer metrics
    totalCustomers: {
      type: Number,
      default: 0
    },
    newCustomers: {
      type: Number,
      default: 0
    },
    returningCustomers: {
      type: Number,
      default: 0
    },
    averageCustomerRating: {
      type: Number,
      default: 0
    },
    
    // Product metrics
    totalProducts: {
      type: Number,
      default: 0
    },
    activeProducts: {
      type: Number,
      default: 0
    },
    lowStockProducts: {
      type: Number,
      default: 0
    },
    outOfStockProducts: {
      type: Number,
      default: 0
    },
    
    // Location metrics
    deliveryAreas: [{
      area: String,
      orderCount: Number,
      revenue: Number
    }],
    
    // Time-based metrics
    peakHours: [{
      hour: Number,
      orderCount: Number
    }],
    
    // Payment metrics
    paymentMethods: {
      online: { type: Number, default: 0 },
      cod: { type: Number, default: 0 }
    }
  },
  productMetrics: [{
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Product'
    },
    name: String,
    quantitySold: Number,
    revenue: Number,
    averageRating: Number,
    totalReviews: Number,
    stockLevel: Number,
    category: String
  }],
  categoryMetrics: [{
    category: String,
    totalOrders: Number,
    totalRevenue: Number,
    averageOrderValue: Number,
    productCount: Number
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

// Create compound index for efficient querying
analyticsSchema.index({ retailerId: 1, date: -1 });

// Create index for date-based queries
analyticsSchema.index({ date: 1 });

// Update the updatedAt timestamp before saving
analyticsSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Add method to calculate daily metrics
analyticsSchema.methods.calculateDailyMetrics = function() {
  const metrics = this.metrics;
  
  // Calculate average order value
  if (metrics.totalOrders > 0) {
    metrics.averageOrderValue = metrics.totalRevenue / metrics.totalOrders;
  }
  
  // Calculate returning customers
  metrics.returningCustomers = metrics.totalCustomers - metrics.newCustomers;
  
  return metrics;
};

const Analytics = mongoose.model('Analytics', analyticsSchema);
export default Analytics; 