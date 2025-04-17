import { body, query, param, validationResult } from 'express-validator';

export const validateCreateProduct = [
  body('name')
    .trim()
    .notEmpty()
    .withMessage('Product name is required')
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  
  body('description')
    .trim()
    .notEmpty()
    .withMessage('Product description is required')
    .isLength({ max: 1000 })
    .withMessage('Product description must be less than 1000 characters'),
  
  body('price')
    .notEmpty()
    .withMessage('Product price is required')
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .trim()
    .notEmpty()
    .withMessage('Product category is required'),
  
  body('subCategory')
    .optional()
    .trim(),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of URLs'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateUpdateProduct = [
  body('name')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Product name must be less than 100 characters'),
  
  body('description')
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage('Product description must be less than 1000 characters'),
  
  body('price')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Price must be a positive number'),
  
  body('stock')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Stock must be a non-negative integer'),
  
  body('category')
    .optional()
    .trim(),
  
  body('subCategory')
    .optional()
    .trim(),
  
  body('images')
    .optional()
    .isArray()
    .withMessage('Images must be an array of URLs'),
  
  body('specifications')
    .optional()
    .isObject()
    .withMessage('Specifications must be an object'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateUpdateStock = [
  body('quantity')
    .notEmpty()
    .withMessage('Quantity is required')
    .isInt({ min: 1 })
    .withMessage('Quantity must be a positive integer'),
  
  body('operation')
    .notEmpty()
    .withMessage('Operation is required')
    .isIn(['add', 'subtract'])
    .withMessage('Operation must be either "add" or "subtract"'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateProductFilters = [
  query('category').optional().trim(),
  query('subCategory').optional().trim(),
  query('minPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Minimum price must be a positive number'),
  query('maxPrice')
    .optional()
    .isFloat({ min: 0 })
    .withMessage('Maximum price must be a positive number'),
  query('search').optional().trim(),
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

export const validateProductId = [
  param('productId')
    .notEmpty()
    .withMessage('Product ID is required')
    .isUUID()
    .withMessage('Invalid product ID format'),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
]; 