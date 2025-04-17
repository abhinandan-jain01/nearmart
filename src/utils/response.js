import { logger } from './logger.js';

/**
 * Standard success response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Success message
 * @param {*} data - Response data
 */
export const successResponse = (res, statusCode = 200, message = 'Success', data = null) => {
  const response = {
    success: true,
    message,
    ...(data !== null && { data })
  };
  logger.info(`Success Response [${statusCode}]: ${message}`);
  return res.status(statusCode).json(response);
};

/**
 * Standard error response format
 * @param {Object} res - Express response object
 * @param {number} statusCode - HTTP status code
 * @param {string} message - Error message
 * @param {*} errors - Detailed error information
 */
export const errorResponse = (res, statusCode = 500, message = 'Internal Server Error', errors = null) => {
  const response = {
    success: false,
    message,
    ...(errors !== null && { errors })
  };
  logger.error(`Error Response [${statusCode}]: ${message}`);
  return res.status(statusCode).json(response);
};

/**
 * Response middleware to add standard response methods to res object
 */
export const responseMiddleware = (req, res, next) => {
  res.success = (message, data, statusCode = 200) => {
    return successResponse(res, statusCode, message, data);
  };

  res.error = (message, errors, statusCode = 500) => {
    return errorResponse(res, statusCode, message, errors);
  };

  next();
}; 