import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger.js';

let io;

function initializeSocket(server) {
  io = new Server(server, {
    cors: {
      origin: process.env.CLIENT_URL || "http://localhost:3000",
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true
    },
    pingTimeout: 60000,
    pingInterval: 25000
  });

  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      logger.warn('Socket connection attempt without token');
      return next(new Error('Authentication error: No token provided'));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.user = decoded;
      logger.info(`Socket authentication successful for user: ${decoded.id}`);
      next();
    } catch (err) {
      logger.error('Socket authentication failed:', err.message);
      next(new Error('Authentication error: Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    logger.info(`User connected: ${socket.user.id}`);
    
    // Join user's personal room
    socket.join(socket.user.id);

    // Join retailer-specific room if user is a retailer
    if (socket.user.role === 'retailer') {
      socket.join(`retailer:${socket.user.id}`);
    }

    // Handle order updates
    socket.on('order:update', (orderData) => {
      logger.info(`Order update received from user ${socket.user.id}:`, orderData);
      // Emit to relevant parties (customer and retailer)
      socket.to(`retailer:${orderData.retailerId}`).emit('order:status', orderData);
      socket.to(orderData.customerId).emit('order:status', orderData);
    });

    // Handle inventory updates
    socket.on('inventory:update', (productData) => {
      logger.info(`Inventory update received from retailer ${socket.user.id}:`, productData);
      // Broadcast to all connected clients
      io.emit('inventory:changed', productData);
    });

    // Handle chat messages
    socket.on('chat:message', (messageData) => {
      logger.info(`Chat message from ${socket.user.id} to ${messageData.to}:`, messageData);
      socket.to(messageData.to).emit('chat:message', {
        ...messageData,
        from: socket.user.id,
        timestamp: new Date()
      });
    });

    // Handle disconnection
    socket.on('disconnect', (reason) => {
      logger.info(`User disconnected: ${socket.user.id}, Reason: ${reason}`);
    });

    // Handle errors
    socket.on('error', (error) => {
      logger.error('Socket error:', error);
    });
  });

  return io;
}

function getSocketIO() {
  if (!io) {
    throw new Error('Socket.IO has not been initialized');
  }
  return io;
}

export { initializeSocket, getSocketIO }; 