import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { AuthService } from '../services/auth.service';
import { UserRepository } from '../repositories/user.repository';
import { OTPRepository } from '../repositories/otp.repository';
import { OTPService } from '../services/otp.service';
import { EmailService } from '../services/email.service';
import { TokenService } from '../services/token.service';
import { authRateLimiter } from '../middleware/rate-limit.middleware';
import { handleValidationErrors } from '../middleware/validation-error.middleware';
import {
  registrationValidation,
  loginValidation,
  otpVerificationValidation,
  otpResendValidation
} from '../middleware/validation.middleware';

/**
 * Auth Routes
 * Requirements: 1.1-6.6, 13.1-13.3
 * 
 * Provides authentication endpoints with validation and rate limiting:
 * - POST /api/auth/register - User registration
 * - POST /api/auth/verify-otp - Email verification
 * - POST /api/auth/resend-otp - OTP resend
 * - POST /api/auth/login - User login
 */

const router = Router();

// Initialize dependencies
const userRepository = new UserRepository();
const otpRepository = new OTPRepository();
const emailService = new EmailService();
const tokenService = new TokenService();
const otpService = new OTPService(otpRepository);
const authService = new AuthService(userRepository, otpService, emailService, tokenService);
const authController = new AuthController(authService);

/**
 * POST /api/auth/register
 * Register a new user account
 * Requirements: 1.1-1.6
 * 
 * Rate limited: 5 requests per minute
 * Validates: email, password, fullName, phoneNumber
 */
router.post(
  '/register',
  authRateLimiter,
  registrationValidation,
  handleValidationErrors,
  authController.register
);

/**
 * POST /api/auth/verify-otp
 * Verify email address with OTP
 * Requirements: 4.1-4.5
 * 
 * Rate limited: 5 requests per minute
 * Validates: email, otp
 */
router.post(
  '/verify-otp',
  authRateLimiter,
  otpVerificationValidation,
  handleValidationErrors,
  authController.verifyOTP
);

/**
 * POST /api/auth/resend-otp
 * Resend OTP to user's email
 * Requirements: 5.1-5.5
 * 
 * Rate limited: 5 requests per minute
 * Validates: email
 */
router.post(
  '/resend-otp',
  authRateLimiter,
  otpResendValidation,
  handleValidationErrors,
  authController.resendOTP
);

/**
 * POST /api/auth/login
 * Login with email and password
 * Requirements: 6.1-6.6
 * 
 * Rate limited: 5 requests per minute
 * Validates: email, password
 */
router.post(
  '/login',
  authRateLimiter,
  loginValidation,
  handleValidationErrors,
  authController.login
);

export default router;
