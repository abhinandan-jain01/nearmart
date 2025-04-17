import bcrypt from 'bcryptjs';
import User from '../models/user.model.js';
import Customer from '../models/customer.model.js';
import { logger } from '../utils/logger.js';
import { successResponse, errorResponse } from '../utils/response.js';
import { generateToken } from '../utils/jwt.js';

const register = async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone } = req.body;

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return errorResponse(res, 400, 'Email already registered');
    }

    // Create new user
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({
      email,
      password: hashedPassword,
      role: 'customer'
    });
    await user.save();

    // Create customer profile
    const customer = new Customer({
      userId: user._id,
      firstName,
      lastName,
      phone
    });
    await customer.save();

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Return response without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return successResponse(res, 201, 'Customer registered successfully', {
      user: {
        ...userWithoutPassword,
        customer: {
          firstName,
          lastName,
          phone
        }
      },
      token
    });
  } catch (error) {
    logger.error('Error in customer register controller:', error);
    return errorResponse(res, 500, 'Failed to register customer', error.message);
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

    // Generate token
    const token = generateToken({ id: user._id, role: user.role });

    // Return response without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    return successResponse(res, 200, 'Login successful', {
      user: userWithoutPassword,
      token
    });
  } catch (error) {
    logger.error('Error in customer login controller:', error);
    return errorResponse(res, 500, 'Failed to login', error.message);
  }
};

const getProfile = async (req, res) => {
  try {
    // Get user information
    const user = await User.findById(req.user.id);
    if (!user) {
      return errorResponse(res, 404, 'User not found');
    }

    // Get customer profile with populated addresses
    const customer = await Customer.findOne({ userId: req.user.id })
      .populate({
        path: 'addresses',
        select: '-customerId' // Exclude customerId from populated addresses
      })
      .populate({
        path: 'defaultAddress',
        select: '-customerId' // Exclude customerId from populated default address
      });

    if (!customer) {
      return errorResponse(res, 404, 'Customer profile not found');
    }

    // Remove sensitive information from user object
    const { password, ...userWithoutPassword } = user.toObject();

    // Combine user and customer information
    const profile = {
      ...userWithoutPassword,
      ...customer.toObject(),
      addresses: customer.addresses || [],
      defaultAddress: customer.defaultAddress || null
    };

    return successResponse(res, 200, 'Profile retrieved successfully', profile);
  } catch (error) {
    logger.error('Error in getProfile controller:', error);
    return errorResponse(res, 500, 'Failed to retrieve profile', error.message);
  }
};

const updateProfile = async (req, res) => {
  try {
    const { firstName, lastName, phone } = req.body;

    const customer = await Customer.findOneAndUpdate(
      { userId: req.user.id },
      { firstName, lastName, phone },
      { new: true }
    );

    if (!customer) {
      return errorResponse(res, 404, 'Customer profile not found');
    }

    return successResponse(res, 200, 'Profile updated successfully', customer);
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