import { body, ValidationChain } from 'express-validator';

/**
 * Validation rules for user authentication endpoints
 * Requirements: 11.1, 11.2, 11.3, 11.4
 */

/**
 * Email format validation
 * Validates that the email follows a valid email format
 */
export const validateEmail = (): ValidationChain => {
  return body('email')
    .trim()
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Invalid email format')
    .normalizeEmail();
};

/**
 * Password strength validation
 * Requirements: min 8 chars, at least one lowercase, one uppercase, one digit
 */
export const validatePassword = (fieldName: string = 'password'): ValidationChain => {
  return body(fieldName)
    .notEmpty()
    .withMessage('Password is required')
    .isLength({ min: 8 })
    .withMessage('Password must be at least 8 characters long')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Password must contain at least one lowercase letter, one uppercase letter, and one digit');
};

/**
 * Phone number format validation (E.164 format)
 * E.164 format: +[country code][number] (e.g., +12345678901)
 */
export const validatePhoneNumber = (): ValidationChain => {
  return body('phoneNumber')
    .trim()
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format. Must be in E.164 format (e.g., +12345678901)');
};

/**
 * OTP format validation (6 digits)
 */
export const validateOTP = (): ValidationChain => {
  return body('otp')
    .trim()
    .notEmpty()
    .withMessage('OTP is required')
    .matches(/^\d{6}$/)
    .withMessage('OTP must be exactly 6 digits');
};

/**
 * Full name validation
 */
export const validateFullName = (): ValidationChain => {
  return body('fullName')
    .trim()
    .notEmpty()
    .withMessage('Full name is required')
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters');
};

/**
 * Validation rule sets for different endpoints
 */

/**
 * Registration validation rules
 * Validates: email, password, fullName, phoneNumber
 */
export const registrationValidation = [
  validateEmail(),
  validatePassword(),
  validateFullName(),
  validatePhoneNumber()
];

/**
 * Login validation rules
 * Validates: email, password
 */
export const loginValidation = [
  validateEmail(),
  validatePassword()
];

/**
 * OTP verification validation rules
 * Validates: email, otp
 */
export const otpVerificationValidation = [
  validateEmail(),
  validateOTP()
];

/**
 * OTP resend validation rules
 * Validates: email
 */
export const otpResendValidation = [
  validateEmail()
];

/**
 * Profile update validation rules
 * Validates: fullName (optional), phoneNumber (optional)
 */
export const profileUpdateValidation = [
  body('fullName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 255 })
    .withMessage('Full name must be between 2 and 255 characters'),
  body('phoneNumber')
    .optional()
    .trim()
    .matches(/^\+?[1-9]\d{1,14}$/)
    .withMessage('Invalid phone number format. Must be in E.164 format'),
  body('profilePicture')
    .optional()
    .trim()
    .isURL()
    .withMessage('Profile picture must be a valid URL')
];

/**
 * Password change validation rules
 * Validates: currentPassword, newPassword
 */
export const passwordChangeValidation = [
  validatePassword('currentPassword'),
  validatePassword('newPassword')
];
