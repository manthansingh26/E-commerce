/**
 * Middleware exports
 * Centralized export point for all middleware components
 */

export { authMiddleware, AuthRequest } from './auth.middleware';
export { authRateLimiter, otpResendRateLimiter } from './rate-limit.middleware';
export { corsMiddleware } from './cors.middleware';
export { handleValidationErrors } from './validation-error.middleware';
export {
  validateEmail,
  validatePassword,
  validatePhoneNumber,
  validateOTP,
  validateFullName,
  registrationValidation,
  loginValidation,
  otpVerificationValidation,
  otpResendValidation,
  profileUpdateValidation,
  passwordChangeValidation
} from './validation.middleware';
