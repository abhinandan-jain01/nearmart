import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import swaggerUi from 'swagger-ui-express';
import rateLimit from 'express-rate-limit';
import { logger } from './utils/logger.js';
import connectDB from './config/database.js';
import swaggerSpecs from './config/swagger.js';
import { responseMiddleware } from './utils/response.js';
import { initializeSocket } from './config/socket.js';
import mongoose from 'mongoose';

// Import routes
import customerRoutes from './routes/customer.routes.js';
import retailerRoutes from './routes/retailer.routes.js';
import productRoutes from './routes/product.routes.js';
import orderRoutes from './routes/order.routes.js';
import storeRoutes from './routes/store.routes.js';
import analyticsRoutes from './routes/analytics.routes.js';
import supportTicketRoutes from './routes/supportTicket.routes.js';

const app = express();

// Security middleware
app.use(helmet());
app.use(cors({
  origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later'
});
app.use(limiter);

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(morgan('combined'));
app.use(responseMiddleware);

// Health check endpoint
app.get('/health', (req, res) => {
  res.success('Server is healthy', { status: 'ok', timestamp: new Date() });
});

// API Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.use('/api/customers', customerRoutes);
app.use('/api/retailers', retailerRoutes);
app.use('/api/products', productRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/stores', storeRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/support', supportTicketRoutes);
app.get("/",(req,res)=>{
  res.send("working");
})

// 404 handler
app.use((req, res) => {
  res.error('Not Found', 'The requested resource was not found', 404);
});

// Error handling middleware
app.use((err, req, res, next) => {
  logger.error(err.stack);

  // Handle specific error types
  if (err.name === 'ValidationError') {
    return res.error('Validation Error', err.message, 400);
  }

  if (err.name === 'UnauthorizedError') {
    return res.error('Unauthorized', err.message, 401);
  }

  if (err.name === 'ForbiddenError') {
    return res.error('Forbidden', err.message, 403);
  }

  // Default error handler
  return res.error('Internal Server Error', err.message, 500);
});

// Connect to MongoDB and start server
const startServer = async (port = process.env.PORT || 3001) => {
  try {
    await connectDB();
    
    const server = app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
      logger.info(`API documentation available at http://localhost:${port}/api-docs`);
    });

    // Graceful shutdown
    const shutdown = async () => {
      logger.info('Received shutdown signal, gracefully shutting down...');
      
      try {
        // Close the server
        await new Promise((resolve) => server.close(resolve));
        
        // Close MongoDB connection
        await mongoose.connection.close();
        
        logger.info('Server and database connections closed');
        process.exit(0);
      } catch (error) {
        logger.error('Error during shutdown:', error);
        process.exit(1);
      }
    };

    process.on('SIGTERM', shutdown);
    process.on('SIGINT', shutdown);

    return server;
  } catch (error) {
    logger.error('Failed to start server:', error);
    throw error;
  }
};

// Only start the server if this file is run directly
if (process.env.NODE_ENV !== 'test') {
  startServer();
}

export { app, startServer }; 


