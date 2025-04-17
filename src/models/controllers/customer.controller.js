import Customer from '../models/customer.model.js';
import { generateToken, verifyToken } from '../utils/jwt.js';
import { logger } from '../utils/logger.js';
import { sendVerificationEmail } from '../utils/email.js';
import { User, Address } from '../models/index.js';
import { successResponse, errorResponse } from '../utils/response.js';

const customerController = {
  // Register a new customer
  async register(req, res) {
    try {
      const { firstName, lastName, email, password, phone } = req.body;

      // Check if customer already exists
      const existingCustomer = await Customer.findOne({ email });
      if (existingCustomer) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      // Create new customer
      const customer = new Customer({
        firstName,
        lastName,
        email,
        password,
        phone
      });

      await customer.save();

      // Generate verification token
      const verificationToken = generateToken({ id: customer._id }, '1d');
      customer.emailVerificationToken = verificationToken;
      customer.emailVerificationExpires = new Date(Date.now() + 24 * 60 * 60 * 1000);
      await customer.save();

      // Send verification email
      await sendVerificationEmail(customer.email, verificationToken);

      // Generate auth token
      const token = generateToken({ id: customer._id });

      res.status(201).json({
        message: 'Registration successful. Please verify your email.',
        token,
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          isVerified: customer.isVerified
        }
      });
    } catch (error) {
      logger.error('Customer registration error:', error);
      res.status(500).json({ message: 'Registration failed', error: error.message });
    }
  },

  // Login customer
  async login(req, res) {
    try {
      const { email, password } = req.body;

      // Find customer
      const customer = await Customer.findOne({ email });
      if (!customer) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check password
      const isMatch = await customer.comparePassword(password);
      if (!isMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      // Check if account is active
      if (!customer.isActive) {
        return res.status(403).json({ message: 'Account is deactivated' });
      }

      // Update last login
      customer.lastLogin = new Date();
      await customer.save();

      // Generate token
      const token = generateToken({ id: customer._id });

      res.json({
        token,
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          isVerified: customer.isVerified
        }
      });
    } catch (error) {
      logger.error('Customer login error:', error);
      res.status(500).json({ message: 'Login failed', error: error.message });
    }
  },

  // Get customer profile
  async getProfile(req, res) {
    try {
      const customer = await Customer.findById(req.user.id)
        .select('-password -passwordResetToken -passwordResetExpires -emailVerificationToken -emailVerificationExpires');
      
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      res.json(customer);
    } catch (error) {
      logger.error('Get customer profile error:', error);
      res.status(500).json({ message: 'Failed to get profile', error: error.message });
    }
  },

  // Update customer profile
  async updateProfile(req, res) {
    try {
      const updates = req.body;
      const allowedUpdates = ['firstName', 'lastName', 'phone', 'preferences'];
      const isValidOperation = Object.keys(updates).every(update => allowedUpdates.includes(update));

      if (!isValidOperation) {
        return res.status(400).json({ message: 'Invalid updates' });
      }

      const customer = await Customer.findById(req.user.id);
      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      Object.keys(updates).forEach(update => {
        customer[update] = updates[update];
      });

      await customer.save();

      res.json({
        message: 'Profile updated successfully',
        customer: {
          id: customer._id,
          firstName: customer.firstName,
          lastName: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          preferences: customer.preferences
        }
      });
    } catch (error) {
      logger.error('Update customer profile error:', error);
      res.status(500).json({ message: 'Failed to update profile', error: error.message });
    }
  },

  // Change password
  async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const customer = await Customer.findById(req.user.id);

      if (!customer) {
        return res.status(404).json({ message: 'Customer not found' });
      }

      // Verify current password
      const isMatch = await customer.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(401).json({ message: 'Current password is incorrect' });
      }

      // Update password
      customer.password = newPassword;
      await customer.save();

      res.json({ message: 'Password changed successfully' });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({ message: 'Failed to change password', error: error.message });
    }
  },

  // Request password reset
  async requestPasswordReset(req, res) {
    try {
      const { email } = req.body;
      const customer = await Customer.findOne({ email });

      if (!customer) {
        return res.status(404).json({ message: 'Email not found' });
      }

      // Generate reset token
      const resetToken = generateToken({ id: customer._id }, '1h');
      customer.passwordResetToken = resetToken;
      customer.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000);
      await customer.save();

      // Send reset email
      await sendPasswordResetEmail(customer.email, resetToken);

      res.json({ message: 'Password reset email sent' });
    } catch (error) {
      logger.error('Request password reset error:', error);
      res.status(500).json({ message: 'Failed to request password reset', error: error.message });
    }
  },

  // Reset password
  async resetPassword(req, res) {
    try {
      const { token, newPassword } = req.body;
      const decoded = verifyToken(token);

      const customer = await Customer.findOne({
        _id: decoded.id,
        passwordResetToken: token,
        passwordResetExpires: { $gt: Date.now() }
      });

      if (!customer) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      // Update password
      customer.password = newPassword;
      customer.passwordResetToken = undefined;
      customer.passwordResetExpires = undefined;
      await customer.save();

      res.json({ message: 'Password reset successful' });
    } catch (error) {
      logger.error('Reset password error:', error);
      res.status(500).json({ message: 'Failed to reset password', error: error.message });
    }
  },

  // Verify email
  async verifyEmail(req, res) {
    try {
      const { token } = req.params;
      const decoded = verifyToken(token);

      const customer = await Customer.findOne({
        _id: decoded.id,
        emailVerificationToken: token,
        emailVerificationExpires: { $gt: Date.now() }
      });

      if (!customer) {
        return res.status(400).json({ message: 'Invalid or expired token' });
      }

      customer.isVerified = true;
      customer.emailVerificationToken = undefined;
      customer.emailVerificationExpires = undefined;
      await customer.save();

      res.json({ message: 'Email verified successfully' });
    } catch (error) {
      logger.error('Verify email error:', error);
      res.status(500).json({ message: 'Failed to verify email', error: error.message });
    }
  },

  getAddresses: async (req, res) => {
    try {
      const addresses = await Address.findAll({
        where: { userId: req.user.id }
      });

      return successResponse(res, 200, 'Addresses retrieved successfully', addresses);
    } catch (error) {
      logger.error('Error getting customer addresses:', error);
      return errorResponse(res, 500, 'Error retrieving addresses', error.message);
    }
  },

  addAddress: async (req, res) => {
    try {
      const { type, address, city, state, country, pincode, isDefault } = req.body;

      // If this is the first address or isDefault is true, update other addresses
      if (isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId: req.user.id } }
        );
      }

      const newAddress = await Address.create({
        userId: req.user.id,
        type,
        address,
        city,
        state,
        country,
        pincode,
        isDefault: isDefault || false
      });

      return successResponse(res, 201, 'Address added successfully', newAddress);
    } catch (error) {
      logger.error('Error adding customer address:', error);
      return errorResponse(res, 500, 'Error adding address', error.message);
    }
  },

  updateAddress: async (req, res) => {
    try {
      const { addressId } = req.params;
      const { type, address, city, state, country, pincode, isDefault } = req.body;

      const addressRecord = await Address.findOne({
        where: { id: addressId, userId: req.user.id }
      });

      if (!addressRecord) {
        return errorResponse(res, 404, 'Address not found');
      }

      // If setting as default, update other addresses
      if (isDefault) {
        await Address.update(
          { isDefault: false },
          { where: { userId: req.user.id, id: { [Op.ne]: addressId } } }
        );
      }

      await addressRecord.update({
        type,
        address,
        city,
        state,
        country,
        pincode,
        isDefault: isDefault || false
      });

      return successResponse(res, 200, 'Address updated successfully', addressRecord);
    } catch (error) {
      logger.error('Error updating customer address:', error);
      return errorResponse(res, 500, 'Error updating address', error.message);
    }
  },

  deleteAddress: async (req, res) => {
    try {
      const { addressId } = req.params;

      const address = await Address.findOne({
        where: { id: addressId, userId: req.user.id }
      });

      if (!address) {
        return errorResponse(res, 404, 'Address not found');
      }

      await address.destroy();
      return successResponse(res, 200, 'Address deleted successfully');
    } catch (error) {
      logger.error('Error deleting customer address:', error);
      return errorResponse(res, 500, 'Error deleting address', error.message);
    }
  }
};

export default customerController; 