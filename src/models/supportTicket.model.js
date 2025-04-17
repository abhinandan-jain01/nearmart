import mongoose from 'mongoose';

const ticketMessageSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'senderType'
  },
  senderType: {
    type: String,
    required: true,
    enum: ['Customer', 'Retailer', 'Support']
  },
  message: {
    type: String,
    required: true
  },
  attachments: [{
    type: String,
    url: String
  }]
}, {
  timestamps: true
});

const supportTicketSchema = new mongoose.Schema({
  customerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Customer',
    required: true
  },
  retailerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Retailer'
  },
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  subject: {
    type: String,
    required: true
  },
  category: {
    type: String,
    enum: ['order', 'payment', 'delivery', 'product', 'account', 'other'],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'resolved', 'closed'],
    default: 'open'
  },
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  messages: [ticketMessageSchema],
  resolution: {
    type: String
  },
  resolvedAt: {
    type: Date
  },
  closedAt: {
    type: Date
  },
  customerSatisfaction: {
    rating: {
      type: Number,
      min: 1,
      max: 5
    },
    feedback: String
  }
}, {
  timestamps: true
});

// Indexes for efficient querying
supportTicketSchema.index({ customerId: 1, status: 1 });
supportTicketSchema.index({ retailerId: 1, status: 1 });
supportTicketSchema.index({ orderId: 1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });

const SupportTicket = mongoose.model('SupportTicket', supportTicketSchema);

export default SupportTicket; 