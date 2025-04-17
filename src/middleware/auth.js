import { verifyToken } from '../utils/jwt.js';
import User from '../models/user.model.js';
import { logger } from '../utils/logger.js';

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.error('No token provided', null, 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res.error('User not found or inactive', null, 401);
    }

    req.user = user;
    next();
  } catch (error) {
    logger.error('Authentication error:', error);
    return res.error('Authentication failed', error.message, 401);
  }
};

const authorize = (roles) => {
  return async (req, res, next) => {
    try {
      if (!req.user) {
        return res.error('User not authenticated', null, 401);
      }

      if (!roles.includes(req.user.role)) {
        return res.error('Unauthorized access', 'User does not have required role', 403);
      }

      // For retailer-specific routes, check if the retailerId matches
      if (req.user.role === 'retailer' && req.params.retailerId) {
        if (req.user.retailerId.toString() !== req.params.retailerId) {
          return res.error('Unauthorized access', 'Retailer can only access their own data', 403);
        }
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      return res.error('Authorization failed', error.message, 403);
    }
  };
};

export { auth, authorize }; 