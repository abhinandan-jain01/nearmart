import mongoose from 'mongoose';

const paymentMethodSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  type: {
    type: String,
    enum: ['credit_card', 'debit_card', 'upi', 'net_banking'],
    required: true
  },
  provider: {
    type: String,
    required: true
  },
  cardNumber: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  cardHolderName: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  expiryMonth: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  expiryYear: {
    type: String,
    required: function() {
      return this.type === 'credit_card' || this.type === 'debit_card';
    }
  },
  upiId: {
    type: String,
    required: function() {
      return this.type === 'upi';
    }
  },
  bankName: {
    type: String,
    required: function() {
      return this.type === 'net_banking';
    }
  },
  accountNumber: {
    type: String,
    required: function() {
      return this.type === 'net_banking';
    }
  },
  isDefault: {
    type: Boolean,
    default: false
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Index for quick lookup of customer's payment methods
paymentMethodSchema.index({ customerId: 1, isActive: 1 });

const PaymentMethod = mongoose.model('PaymentMethod', paymentMethodSchema);

export default PaymentMethod; 