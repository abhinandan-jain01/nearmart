import jwt from 'jsonwebtoken';
import { logger } from './logger.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '1d';

export const generateToken = (payload, expiresIn = JWT_EXPIRES_IN) => {
  try {
    return jwt.sign(payload, JWT_SECRET, { expiresIn });
  } catch (error) {
    logger.error('Error generating token:', error);
    throw new Error('Failed to generate token');
  }
};

export const verifyToken = (token) => {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    logger.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}; 