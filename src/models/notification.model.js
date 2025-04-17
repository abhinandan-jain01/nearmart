import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    refPath: 'userType'
  },
  userType: {
    type: String,
    required: true,
    enum: ['Customer', 'Retailer']
  },
  type: {
    type: String,
    enum: ['order', 'promotion', 'system', 'review', 'payment'],
    required: true
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  data: {
    type: mongoose.Schema.Types.Mixed
  },
  isRead: {
    type: Boolean,
    default: false
  },
  readAt: {
    type: Date
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high'],
    default: 'medium'
  },
  expiresAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Index for quick lookup of unread notifications
notificationSchema.index({ userId: 1, userType: 1, isRead: 1 });

const Notification = mongoose.model('Notification', notificationSchema);

export default Notification; 