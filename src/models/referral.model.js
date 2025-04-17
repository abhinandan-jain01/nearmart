import mongoose from 'mongoose';

const referralSchema = new mongoose.Schema({
  referrerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  referredId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true,
    unique: true
  },
  code: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'expired'],
    default: 'pending'
  },
  rewardStatus: {
    type: String,
    enum: ['pending', 'credited', 'failed'],
    default: 'pending'
  },
  referrerReward: {
    points: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  referredReward: {
    points: {
      type: Number,
      default: 0
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  completedAt: {
    type: Date
  },
  expiresAt: {
    type: Date,
    default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
  }
}, {
  timestamps: true
});

// Index for quick lookup of referrals
referralSchema.index({ referrerId: 1, status: 1 });
referralSchema.index({ referredId: 1 });
referralSchema.index({ code: 1 });

const Referral = mongoose.model('Referral', referralSchema);

export default Referral; 