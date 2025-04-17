import mongoose from 'mongoose';

const reviewSchema = new mongoose.Schema({
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true,
    index: true
  },
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    minlength: 10,
    maxlength: 500
  },
  images: [{
    type: String,
    validate: {
      validator: function(v) {
        return /^https?:\/\/.+/.test(v);
      },
      message: 'Invalid image URL'
    }
  }],
  likes: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  orderIds: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  }]
}, {
  timestamps: true
});

// Compound index to ensure one review per customer per retailer
reviewSchema.index({ retailerId: 1, customerId: 1 }, { unique: true });

// Method to check if a customer has ordered from this retailer
reviewSchema.methods.hasOrdered = async function() {
  const Order = mongoose.model('Order');
  const order = await Order.findOne({
    customerId: this.customerId,
    retailerId: this.retailerId,
    status: 'delivered'
  });
  return !!order;
};

export const Review = mongoose.model('Review', reviewSchema); 