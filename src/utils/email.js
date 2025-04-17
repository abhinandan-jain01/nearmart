import nodemailer from 'nodemailer';
import { logger } from './logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

export const sendVerificationEmail = async (email, token) => {
  try {
    const verificationUrl = `${process.env.FRONTEND_URL}/verify-email/${token}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Verify your email',
      html: `
        <h1>Welcome to our platform!</h1>
        <p>Please click the link below to verify your email address:</p>
        <a href="${verificationUrl}">Verify Email</a>
        <p>If you did not create an account, please ignore this email.</p>
      `
    });
  } catch (error) {
    logger.error('Error sending verification email:', error);
    throw new Error('Failed to send verification email');
  }
};

export const sendPasswordResetEmail = async (email, token) => {
  try {
    const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${token}`;
    
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email,
      subject: 'Reset your password',
      html: `
        <h1>Password Reset Request</h1>
        <p>You requested to reset your password. Click the link below to proceed:</p>
        <a href="${resetUrl}">Reset Password</a>
        <p>If you did not request a password reset, please ignore this email.</p>
        <p>This link will expire in 1 hour.</p>
      `
    });
  } catch (error) {
    logger.error('Error sending password reset email:', error);
    throw new Error('Failed to send password reset email');
  }
}; 