import { logger } from '../utils/logger.js';

export const authorize = (roles = []) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      if (roles.length && !roles.includes(req.user.role)) {
        return res.status(403).json({ message: 'Forbidden' });
      }

      // For retailer-specific routes, check if the retailer owns the resource
      if (req.user.role === 'retailer' && req.params.retailerId) {
        if (req.user.id !== req.params.retailerId) {
          return res.status(403).json({ message: 'Access denied to this resource' });
        }
      }

      next();
    } catch (error) {
      logger.error('Authorization error:', error);
      res.status(500).json({ message: 'Authorization failed', error: error.message });
    }
  };
}; 