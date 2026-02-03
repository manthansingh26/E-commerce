import { Router } from 'express';
import { UserController } from '../controllers/user.controller';
import { UserService } from '../services/user.service';
import { UserRepository } from '../repositories/user.repository';
import { authMiddleware } from '../middleware/auth.middleware';
import { handleValidationErrors } from '../middleware/validation-error.middleware';
import {
  profileUpdateValidation,
  passwordChangeValidation
} from '../middleware/validation.middleware';

/**
 * User Routes
 * Requirements: 7.1-7.4, 8.1-10.5
 * 
 * Provides user profile and account management endpoints:
 * - GET /api/users/profile - Get user profile
 * - PUT /api/users/profile - Update user profile
 * - PUT /api/users/change-password - Change password
 * 
 * All routes require JWT authentication
 */

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const userService = new UserService(userRepository);
const userController = new UserController(userService);

/**
 * GET /api/users/profile
 * Get authenticated user's profile
 * Requirements: 8.1-8.3
 * 
 * Requires: JWT authentication
 * Returns: User profile (id, email, fullName, phoneNumber, profilePicture, createdAt)
 */
router.get(
  '/profile',
  authMiddleware.authenticate,
  userController.getProfile
);

/**
 * PUT /api/users/profile
 * Update authenticated user's profile
 * Requirements: 9.1-9.6
 * 
 * Requires: JWT authentication
 * Validates: fullName (optional), phoneNumber (optional), profilePicture (optional)
 * Note: Email updates are not allowed
 */
router.put(
  '/profile',
  authMiddleware.authenticate,
  profileUpdateValidation,
  handleValidationErrors,
  userController.updateProfile
);

/**
 * PUT /api/users/change-password
 * Change authenticated user's password
 * Requirements: 10.1-10.5
 * 
 * Requires: JWT authentication
 * Validates: currentPassword, newPassword
 */
router.put(
  '/change-password',
  authMiddleware.authenticate,
  passwordChangeValidation,
  handleValidationErrors,
  userController.changePassword
);

export default router;
