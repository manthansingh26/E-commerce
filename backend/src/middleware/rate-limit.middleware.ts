import rateLimit from 'express-rate-limit';
import { config } from '../config/env';

/**
 * Rate Limiting Middleware
 * Requirements: 13.1, 13.2, 13.3
 * 
 * Limits the number of requests from a client IP address to prevent brute force attacks
 * Configured for authentication endpoints: 5 requests per minute
 */

/**
 * Rate limiter for authentication endpoints
 * 
 * Requirements:
 * - 13.1: Track requests by client IP address
 * - 13.2: Reject requests exceeding 5 per minute
 * - 13.3: Reset counter after window expires
 */
export const authRateLimiter = rateLimit({
  // Time window in milliseconds (default: 60000ms = 1 minute)
  windowMs: config.rateLimit.windowMs,
  
  // Maximum number of requests per window (default: 5)
  max: config.rateLimit.maxRequests,
  
  // Use client IP address for tracking
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  
  // Error message when rate limit is exceeded
  message: {
    error: {
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_ERROR',
      details: 'Too many requests. Please try again later.'
    }
  },
  
  // Status code to return when rate limit is exceeded
  statusCode: 429,
  
  // Skip successful requests (only count failed attempts)
  // Set to false to count all requests
  skipSuccessfulRequests: false,
  
  // Skip failed requests
  skipFailedRequests: false,
});

/**
 * Stricter rate limiter for OTP resend endpoint
 * 3 requests per hour as per requirement 5.2
 */
export const otpResendRateLimiter = rateLimit({
  // 60 minutes window
  windowMs: config.otp.resendWindowMinutes * 60 * 1000,
  
  // Maximum 3 requests per window
  max: config.otp.resendLimit,
  
  standardHeaders: true,
  legacyHeaders: false,
  
  message: {
    error: {
      message: 'Rate limit exceeded',
      code: 'RATE_LIMIT_ERROR',
      details: 'Too many OTP resend requests. Please try again later.'
    }
  },
  
  statusCode: 429,
  skipSuccessfulRequests: false,
  skipFailedRequests: false,
});
