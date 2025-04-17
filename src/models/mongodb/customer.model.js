import mongoose from 'mongoose';

const customerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  phone: {
    type: String,
    required: true
  },
  addresses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  }],
  defaultAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address'
  },
  orders: [{
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order'
    },
    retailerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Retailer'
    },
    totalAmount: Number,
    status: String,
    createdAt: Date
  }],
  isVerified: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Create indexes for efficient querying
customerSchema.index({ userId: 1 });
customerSchema.index({ phone: 1 });
customerSchema.index({ 'orders.retailerId': 1 });

const Customer = mongoose.model('Customer', customerSchema);
export default Customer; 