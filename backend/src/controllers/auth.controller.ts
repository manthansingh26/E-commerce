import { Request, Response } from 'express';
import { AuthService } from '../services/auth.service';

/**
 * AuthController
 * Handles authentication-related HTTP requests
 * Requirements: 1.1-1.6, 4.1-4.5, 5.1-5.5, 6.1-6.6
 */
export class AuthController {
  private authService: AuthService;

  constructor(authService: AuthService) {
    this.authService = authService;
  }

  /**
   * Register endpoint handler
   * POST /api/auth/register
   * Requirements: 1.1-1.6
   */
  register = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password, fullName, phoneNumber } = req.body;

      const result = await this.authService.registerUser({
        email,
        password,
        fullName,
        phoneNumber
      });

      res.status(201).json({
        message: 'Registration successful. Please check your email for OTP verification.',
        userId: result.userId
      });
    } catch (error: any) {
      // Handle duplicate email error
      if (error.message === 'Email already registered') {
        res.status(409).json({
          error: {
            message: 'Resource conflict',
            code: 'CONFLICT',
            details: 'Email already registered'
          }
        });
        return;
      }

      // Handle missing required fields
      if (error.message === 'Missing required fields') {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: 'Missing required fields'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred during registration'
        }
      });
    }
  };

  /**
   * Verify OTP endpoint handler
   * POST /api/auth/verify-otp
   * Requirements: 4.1-4.5
   */
  verifyOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, otp } = req.body;

      await this.authService.verifyUserOTP(email, otp);

      res.status(200).json({
        message: 'Email verified successfully. You can now login.'
      });
    } catch (error: any) {
      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
            details: 'No user found with the provided email'
          }
        });
        return;
      }

      // Handle invalid or expired OTP
      if (error.message === 'Invalid or expired OTP') {
        res.status(400).json({
          error: {
            message: 'Validation failed',
            code: 'VALIDATION_ERROR',
            details: 'Invalid or expired OTP'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred during OTP verification'
        }
      });
    }
  };

  /**
   * Resend OTP endpoint handler
   * POST /api/auth/resend-otp
   * Requirements: 5.1-5.5
   */
  resendOTP = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email } = req.body;

      await this.authService.resendOTP(email);

      res.status(200).json({
        message: 'OTP resent successfully. Please check your email.'
      });
    } catch (error: any) {
      // Handle user not found
      if (error.message === 'User not found') {
        res.status(404).json({
          error: {
            message: 'User not found',
            code: 'NOT_FOUND',
            details: 'No user found with the provided email'
          }
        });
        return;
      }

      // Handle rate limit exceeded
      if (error.message.includes('Maximum OTP resend attempts exceeded')) {
        res.status(429).json({
          error: {
            message: 'Rate limit exceeded',
            code: 'RATE_LIMIT_ERROR',
            details: 'Maximum OTP resend attempts exceeded. Please try again later.'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred during OTP resend'
        }
      });
    }
  };

  /**
   * Login endpoint handler
   * POST /api/auth/login
   * Requirements: 6.1-6.6
   */
  login = async (req: Request, res: Response): Promise<void> => {
    try {
      const { email, password } = req.body;

      const result = await this.authService.loginUser(email, password);

      res.status(200).json({
        message: 'Login successful',
        token: result.token,
        user: result.user
      });
    } catch (error: any) {
      // Handle invalid credentials
      if (error.message === 'Invalid email or password') {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Invalid email or password'
          }
        });
        return;
      }

      // Handle email verification required
      if (error.message === 'Email verification required') {
        res.status(401).json({
          error: {
            message: 'Authentication failed',
            code: 'AUTH_ERROR',
            details: 'Email verification required. Please verify your email before logging in.'
          }
        });
        return;
      }

      // Handle other errors
      res.status(500).json({
        error: {
          message: 'Internal server error',
          code: 'INTERNAL_ERROR',
          details: 'An unexpected error occurred during login'
        }
      });
    }
  };
}
