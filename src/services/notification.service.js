import { getSocketIO } from '../config/socket.js';
import { logger } from '../utils/logger.js';

class NotificationService {
  constructor() {
    this.notifications = new Map();
  }

  async sendNotification(userId, notification) {
    try {
      const io = getSocketIO();
      io.to(userId).emit('notification', notification);
      
      // Store notification for retrieval
      if (!this.notifications.has(userId)) {
        this.notifications.set(userId, []);
      }
      this.notifications.get(userId).push({
        ...notification,
        timestamp: new Date()
      });
      
      logger.info(`Notification sent to user ${userId}`);
    } catch (error) {
      logger.error('Error sending notification:', error);
    }
  }

  getNotifications(userId) {
    return this.notifications.get(userId) || [];
  }

  clearNotifications(userId) {
    this.notifications.delete(userId);
  }
}

const notificationService = new NotificationService();
export { notificationService as default }; 