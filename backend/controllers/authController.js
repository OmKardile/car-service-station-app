const bcrypt = require('bcryptjs');
const { validationResult } = require('express-validator');
const { User } = require('../models');
const JWTService = require('../utils/jwt');
const logger = require('../utils/logger');

class AuthController {
  // Register new user
  static async register(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password, firstName, lastName, phone } = req.body;

      // Check if user exists
      const existingUser = await User.findOne({ where: { email } });
      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: 'User already exists with this email'
        });
      }

      // Hash password
      const hashedPassword = await bcrypt.hash(password, 12);

      // Create user
      const user = await User.create({
        email,
        password: hashedPassword,
        firstName,
        lastName,
        phone,
        role: 'client'
      });

      // Generate tokens
      const accessToken = JWTService.generateAccessToken(user);
      const refreshToken = JWTService.generateRefreshToken(user);

      // Save refresh token
      await User.update(
        { refreshToken },
        { where: { id: user.id } }
      );

      logger.info(`User registered: ${email}`);

      res.status(201).json({
        success: true,
        message: 'User registered successfully',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Registration error:', error);
      res.status(500).json({
        success: false,
        message: 'Registration failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Login user
  static async login(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { email, password } = req.body;

      // Find user with password
      const user = await User.scope('withSensitive').findOne({ where: { email } });
      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Check password
      const isPasswordValid = await bcrypt.compare(password, user.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          success: false,
          message: 'Invalid credentials'
        });
      }

      // Generate tokens
      const accessToken = JWTService.generateAccessToken(user);
      const refreshToken = JWTService.generateRefreshToken(user);

      // Save refresh token
      await User.update(
        { refreshToken },
        { where: { id: user.id } }
      );

      logger.info(`User logged in: ${email}`);

      res.json({
        success: true,
        message: 'Login successful',
        data: {
          user: {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            phone: user.phone,
            role: user.role,
            createdAt: user.createdAt
          },
          tokens: {
            accessToken,
            refreshToken
          }
        }
      });
    } catch (error) {
      logger.error('Login error:', error);
      res.status(500).json({
        success: false,
        message: 'Login failed',
        error: process.env.NODE_ENV === 'development' ? error.message : undefined
      });
    }
  }

  // Refresh token
  static async refreshToken(req, res) {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Refresh token required'
        });
      }

      // Verify refresh token
      const decoded = JWTService.verifyRefreshToken(refreshToken);
      
      // Find user with this refresh token
      const user = await User.scope('withSensitive').findOne({ 
        where: { 
          id: decoded.userId,
          refreshToken 
        } 
      });

      if (!user || !user.isActive) {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      // Generate new tokens
      const newAccessToken = JWTService.generateAccessToken(user);
      const newRefreshToken = JWTService.generateRefreshToken(user);

      // Update refresh token
      await User.update(
        { refreshToken: newRefreshToken },
        { where: { id: user.id } }
      );

      logger.info(`Token refreshed for user: ${user.email}`);

      res.json({
        success: true,
        message: 'Token refreshed successfully',
        data: {
          accessToken: newAccessToken,
          refreshToken: newRefreshToken
        }
      });
    } catch (error) {
      logger.error('Token refresh error:', error);
      
      if (error.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          message: 'Invalid refresh token'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Token refresh failed'
      });
    }
  }

  // Logout user
  static async logout(req, res) {
    try {
      const { userId } = req.user;

      // Clear refresh token
      await User.update(
        { refreshToken: null },
        { where: { id: userId } }
      );

      logger.info(`User logged out: ${userId}`);

      res.json({
        success: true,
        message: 'Logout successful'
      });
    } catch (error) {
      logger.error('Logout error:', error);
      res.status(500).json({
        success: false,
        message: 'Logout failed'
      });
    }
  }

  // Get user profile
  static async getProfile(req, res) {
    try {
      const user = await User.findByPk(req.user.userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      res.json({
        success: true,
        data: { user }
      });
    } catch (error) {
      logger.error('Get profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to get profile'
      });
    }
  }

  // Update user profile
  static async updateProfile(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          success: false,
          message: 'Validation failed',
          errors: errors.array()
        });
      }

      const { firstName, lastName, phone } = req.body;
      const { userId } = req.user;

      // Update user
      await User.update(
        { firstName, lastName, phone },
        { where: { id: userId } }
      );

      // Get updated user
      const updatedUser = await User.findByPk(userId, {
        attributes: { exclude: ['password', 'refreshToken'] }
      });

      logger.info(`Profile updated for user: ${userId}`);

      res.json({
        success: true,
        message: 'Profile updated successfully',
        data: { user: updatedUser }
      });
    } catch (error) {
      logger.error('Update profile error:', error);
      res.status(500).json({
        success: false,
        message: 'Profile update failed'
      });
    }
  }

  // Change password
  static async changePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;
      const { userId } = req.user;

      // Find user with password
      const user = await User.scope('withSensitive').findByPk(userId);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'User not found'
        });
      }

      // Check current password
      const isPasswordValid = await bcrypt.compare(currentPassword, user.password);
      if (!isPasswordValid) {
        return res.status(400).json({
          success: false,
          message: 'Current password is incorrect'
        });
      }

      // Hash new password
      const hashedPassword = await bcrypt.hash(newPassword, 12);

      // Update password
      await User.update(
        { password: hashedPassword },
        { where: { id: userId } }
      );

      logger.info(`Password changed for user: ${userId}`);

      res.json({
        success: true,
        message: 'Password changed successfully'
      });
    } catch (error) {
      logger.error('Change password error:', error);
      res.status(500).json({
        success: false,
        message: 'Failed to change password'
      });
    }
  }
}

module.exports = AuthController;