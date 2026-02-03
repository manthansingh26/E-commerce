import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.middleware';
import { UserService } from '../services/user.service';

/**
 * UserController
 * Handles user profile and account management HTTP requests
 * Requirements: 8.1-8.3, 9.1-9.6, 10.1-10.5
 */
export class UserController {
  private userService: UserService;

  constructor(userService: UserService) {
    this.userService = userService;
  }

  /**
   * Get profile endpoint handler
   * GET /api/users/profile
   * Requirements: 8.1-8.3
   */
  getProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // User ID is attached by auth middleware
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'User not authenticated'
          }
        });
        return;
      }

      const userProfile = await this.userService.getUserProfile(userId);

      res.status(200).json({
        user: userProfile
      });
    } catch (error: any) {
      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
            details: 'User profile not found'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred while fetching profile'
        }
      });
    }
  };

  /**
   * Update profile endpoint handler
   * PUT /api/users/profile
   * Requirements: 9.1-9.6
   */
  updateProfile = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // User ID is attached by auth middleware
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'User not authenticated'
          }
        });
        return;
      }

      const { fullName, phoneNumber, profilePicture, email } = req.body;

      // Check if email update is attempted
      if (email !== undefined) {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: 'Email updates are not supported'
          }
        });
        return;
      }

      const updates = {
        fullName,
        phoneNumber,
        profilePicture
      };

      const updatedProfile = await this.userService.updateUserProfile(userId, updates);

      res.status(200).json({
        message: 'Profile updated successfully',
        user: updatedProfile
      });
    } catch (error: any) {
      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
            details: 'User profile not found'
          }
        });
        return;
      }

      // Handle email update attempt
      if (error.message === 'Email updates are not supported') {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: 'Email updates are not supported'
          }
        });
        return;
      }

      // Handle no valid fields to update
      if (error.message === 'No valid fields to update') {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: 'No valid fields to update'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred while updating profile'
        }
      });
    }
  };

  /**
   * Change password endpoint handler
   * PUT /api/users/change-password
   * Requirements: 10.1-10.5
   */
  changePassword = async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      // User ID is attached by auth middleware
      const userId = req.user?.userId;

      if (!userId) {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'User not authenticated'
          }
        });
        return;
      }

      const { currentPassword, newPassword } = req.body;

      await this.userService.changePassword(userId, currentPassword, newPassword);

      res.status(200).json({
        message: 'Password changed successfully'
      });
    } catch (error: any) {
      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
            details: 'User not found'
          }
        });
        return;
      }

      // Handle incorrect current password
      if (error.message === 'Current password is incorrect') {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Current password is incorrect'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred while changing password'
        }
      });
    }
  };
}
