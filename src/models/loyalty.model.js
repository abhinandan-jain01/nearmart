import mongoose from 'mongoose';

const loyaltyTransactionSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['earn', 'redeem', 'expire', 'adjust'],
    required: true
  },
  points: {
    type: Number,
    required: true
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  description: {
    type: String,
    required: true
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

const loyaltySchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  totalPoints: {
    type: Number,
    default: 0
  },
  availablePoints: {
    type: Number,
    default: 0
  },
  redeemedPoints: {
    type: Number,
    default: 0
  },
  expiredPoints: {
    type: Number,
    default: 0
  },
  tier: {
    type: String,
    enum: ['bronze', 'silver', 'gold', 'platinum'],
    default: 'bronze'
  },
  transactions: [loyaltyTransactionSchema]
}, {
  timestamps: true
});

// Index for quick lookup of customer's loyalty status
loyaltySchema.index({ customerId: 1, tier: 1 });

const Loyalty = mongoose.model('Loyalty', loyaltySchema);

export default Loyalty; 