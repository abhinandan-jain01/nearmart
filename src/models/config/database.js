import mongoose from 'mongoose';
import { logger } from '../utils/logger.js';

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI;
    logger.info(`Attempting to connect to MongoDB at: ${mongoURI}`);
    
    // Add retryWrites and w=majority to the connection string if not already present
    const uri = mongoURI.includes('retryWrites') ? mongoURI : `${mongoURI}?retryWrites=true&w=majority`;
    
    const conn = await mongoose.connect(uri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 30000, // Increase timeout to 30 seconds
      heartbeatFrequencyMS: 2000,      // More frequent heartbeats
      family: 4                        // Force IPv4
    });

    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    logger.error(`Error: ${error.message}`);
    // Log more detailed error information
    if (error.name === 'MongoServerSelectionError') {
      logger.error('Failed to select MongoDB server:', {
        name: error.name,
        message: error.message,
        reason: error.reason
      });
    }
    throw error;
  }
};

// Handle MongoDB connection errors
mongoose.connection.on('error', (err) => {
  logger.error('MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
  logger.warn('MongoDB disconnected');
});

mongoose.connection.on('connected', () => {
  logger.info('MongoDB connected successfully');
});

// export default connectDB; 
export default connectDB; 