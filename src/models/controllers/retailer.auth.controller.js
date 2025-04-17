import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Retailer from '../models/retailer.model.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateToken } from '../utils/jwt.js';

const register = async (req, res) => {
  try {
    const { email, password, businessName, phone, businessType, taxId, address } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'User already exists');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'retailer'
    });
    await user.save();

    // Create retailer profile
    const retailer = new Retailer({
      userId: user._id,
      businessName,
      phone,
      businessType,
      taxId,
      address,
      isVerified: false,
      isActive: true
    });
    await retailer.save();

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Return response without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return successResponse(res, 201, 'Retailer registered successfully', {
      user: userWithoutPassword,
      retailer,
      token
    });
  } catch (error) {
    logger.error('Error in retailer register controller:', error);
    return errorResponse(res, 500, 'Failed to register retailer', error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Find user
    const user = await User.findOne({ email });
    if (!user) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return errorResponse(res, 401, 'Invalid credentials');
    }

    // Check if account is active
    if (!user.isActive) {
      return errorResponse(res, 403, 'Account is inactive');
    }

    // Update last login
    user.lastLogin = new Date();
    await user.save();

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Get retailer profile
    const retailer = await Retailer.findOne({ userId: user._id });
    if (!retailer) {
      return errorResponse(res, 404, 'Retailer profile not found');
    }

    // Return response without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return successResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      retailer,
      token
    });
  } catch (error) {
    logger.error('Error in retailer login controller:', error);
    return errorResponse(res, 500, 'Failed to login', error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    const retailer = await Retailer.findOne({ userId: req.user.id });
    if (!retailer) {
      return errorResponse(res, 404, 'Retailer profile not found');
    }
    return successResponse(res, 200, 'Profile retrieved successfully', retailer);
  } catch (error) {
    logger.error('Error in getProfile controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const retailer = await Retailer.findOneAndUpdate(
      { userId: req.user.id },
      req.body,
      { new: true }
    );
    if (!retailer) {
      return errorResponse(res, 404, 'Retailer profile not found');
    }
    return successResponse(res, 200, 'Profile updated successfully', retailer);
  } catch (error) {
    logger.error('Error in updateProfile controller:', error);
    return errorResponse(res, 500, 'Failed to update profile', error.message);
  }
};

export default {
  register,
  login,
  getProfile,
  updateProfile
}; 