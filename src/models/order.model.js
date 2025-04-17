import mongoose from 'mongoose';

const orderItemSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  }
});

const orderSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer',
    required: true
  },
  items: [orderItemSchema],
  totalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled'],
    default: 'pending'
  },
  shippingAddress: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Address',
    required: true
  },
  paymentStatus: {
    type: String,
    enum: ['pending', 'paid', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    required: true
  },
  paymentId: {
    type: String
  },
  trackingNumber: {
    type: String
  }
}, {
  timestamps: true
});

const Order = mongoose.model('Order', orderSchema);
const OrderItem = mongoose.model('OrderItem', orderItemSchema);

export { Order, OrderItem }; 