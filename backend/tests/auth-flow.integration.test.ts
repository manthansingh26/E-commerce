import { UserRepository } from '../src/repositories/user.repository';
import { OTPRepository } from '../src/repositories/otp.repository';
import { AuthService } from '../src/services/auth.service';
import { UserService } from '../src/services/user.service';
import { OTPService } from '../src/services/otp.service';
import { EmailService } from '../src/services/email.service';
import { TokenService } from '../src/services/token.service';
import { pool } from '../src/config/database';

// Mock the email service to avoid sending real emails during tests
jest.mock('../src/services/email.service');

/**
 * Integration tests for complete authentication flows
 * Tests end-to-end scenarios from registration to profile management
 * Requirements: 1.1-10.5
 */

describe('Authentication Flow Integration Tests', () => {
  let userRepository: UserRepository;
  let otpRepository: OTPRepository;
  let authService: AuthService;
  let userService: UserService;
  let otpService: OTPService;
  let emailService: EmailService;
  let tokenService: TokenService;

  beforeAll(async () => {
    userRepository = new UserRepository();
    otpRepository = new OTPRepository();
    otpService = new OTPService(otpRepository);
    emailService = new EmailService();
    
    // Mock the sendOTPEmail method
    (emailService.sendOTPEmail as jest.Mock) = jest.fn().mockResolvedValue(undefined);
    
    tokenService = new TokenService();
    authService = new AuthService(userRepository, otpService, emailService, tokenService);
    userService = new UserService(userRepository);
  });

  afterEach(async () => {
    // Clean up test data
    await pool.query('DELETE FROM otps WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%@integration.test%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@integration.test%']);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Complete Registration → OTP Verification → Login Flow', () => {
    it('should successfully complete registration, verify OTP, and login', async () => {
      const testEmail = 'user1@integration.test';
      const testPassword = 'TestPass123';
      const testFullName = 'Test User One';
      const testPhoneNumber = '+12345678901';

      // Step 1: Register user
      const registerResult = await authService.registerUser({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
        phoneNumber: testPhoneNumber
      });

      expect(registerResult.userId).toBeDefined();

      // Verify user is created but not verified
      const user = await userRepository.findByEmail(testEmail);
      expect(user).not.toBeNull();
      expect(user?.isVerified).toBe(false);

      // Verify OTP was created
      const otpRecord = await otpRepository.findByUserId(registerResult.userId);
      expect(otpRecord).not.toBeNull();
      expect(otpRecord?.otpCode).toMatch(/^\d{6}$/);

      // Step 2: Verify OTP
      const otp = otpRecord!.otpCode;
      await authService.verifyUserOTP(testEmail, otp);

      // Verify user is now verified
      const verifiedUser = await userRepository.findByEmail(testEmail);
      expect(verifiedUser?.isVerified).toBe(true);

      // Verify OTP was deleted
      const deletedOTP = await otpRepository.findByUserId(registerResult.userId);
      expect(deletedOTP).toBeNull();

      // Step 3: Login
      const loginResult = await authService.loginUser(testEmail, testPassword);

      expect(loginResult.token).toBeDefined();
      expect(loginResult.user).toBeDefined();
      expect(loginResult.user.email).toBe(testEmail);
      expect(loginResult.user.fullName).toBe(testFullName);
      expect(loginResult.user.phoneNumber).toBe(testPhoneNumber);

      // Verify token is valid
      const tokenPayload = tokenService.verifyToken(loginResult.token);
      expect(tokenPayload.userId).toBe(registerResult.userId);
      expect(tokenPayload.email).toBe(testEmail);
    });
  });

  describe('Registration → OTP Resend → Verification → Login Flow', () => {
    it('should successfully complete registration, resend OTP, verify, and login', async () => {
      const testEmail = 'user2@integration.test';
      const testPassword = 'TestPass456';
      const testFullName = 'Test User Two';
      const testPhoneNumber = '+12345678902';

      // Step 1: Register user
      const registerResult = await authService.registerUser({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
        phoneNumber: testPhoneNumber
      });

      // Get first OTP
      const firstOTP = await otpRepository.findByUserId(registerResult.userId);
      expect(firstOTP).not.toBeNull();
      const firstOTPCode = firstOTP!.otpCode;

      // Step 2: Resend OTP
      await authService.resendOTP(testEmail);

      // Verify new OTP was created and old one invalidated
      const secondOTP = await otpRepository.findByUserId(registerResult.userId);
      expect(secondOTP).not.toBeNull();
      expect(secondOTP!.otpCode).not.toBe(firstOTPCode);

      // Step 3: Verify with new OTP
      await authService.verifyUserOTP(testEmail, secondOTP!.otpCode);

      // Verify user is verified
      const verifiedUser = await userRepository.findByEmail(testEmail);
      expect(verifiedUser?.isVerified).toBe(true);

      // Step 4: Login
      const loginResult = await authService.loginUser(testEmail, testPassword);

      expect(loginResult.token).toBeDefined();
      expect(loginResult.user.email).toBe(testEmail);
    });
  });

  describe('Profile Management After Login', () => {
    it('should retrieve and update profile after successful login', async () => {
      const testEmail = 'user3@integration.test';
      const testPassword = 'TestPass789';
      const testFullName = 'Test User Three';
      const testPhoneNumber = '+12345678903';

      // Register and verify user
      const registerResult = await authService.registerUser({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
        phoneNumber: testPhoneNumber
      });

      const otpRecord = await otpRepository.findByUserId(registerResult.userId);
      await authService.verifyUserOTP(testEmail, otpRecord!.otpCode);

      // Login
      await authService.loginUser(testEmail, testPassword);

      // Get profile
      const profile = await userService.getUserProfile(registerResult.userId);
      expect(profile.email).toBe(testEmail);
      expect(profile.fullName).toBe(testFullName);
      expect(profile.phoneNumber).toBe(testPhoneNumber);

      // Update profile
      const updatedFullName = 'Updated User Three';
      const updatedPhoneNumber = '+19876543210';
      const updatedProfile = await userService.updateUserProfile(registerResult.userId, {
        fullName: updatedFullName,
        phoneNumber: updatedPhoneNumber
      });

      expect(updatedProfile.fullName).toBe(updatedFullName);
      expect(updatedProfile.phoneNumber).toBe(updatedPhoneNumber);
      expect(updatedProfile.email).toBe(testEmail); // Email should not change

      // Verify updates persisted
      const retrievedProfile = await userService.getUserProfile(registerResult.userId);
      expect(retrievedProfile.fullName).toBe(updatedFullName);
      expect(retrievedProfile.phoneNumber).toBe(updatedPhoneNumber);
    });
  });

  describe('Password Change Flow', () => {
    it('should successfully change password after login', async () => {
      const testEmail = 'user4@integration.test';
      const testPassword = 'OldPass123';
      const newPassword = 'NewPass456';
      const testFullName = 'Test User Four';
      const testPhoneNumber = '+12345678904';

      // Register and verify user
      const registerResult = await authService.registerUser({
        email: testEmail,
        password: testPassword,
        fullName: testFullName,
        phoneNumber: testPhoneNumber
      });

      const otpRecord = await otpRepository.findByUserId(registerResult.userId);
      await authService.verifyUserOTP(testEmail, otpRecord!.otpCode);

      // Login with old password
      const firstLoginResult = await authService.loginUser(testEmail, testPassword);
      expect(firstLoginResult.token).toBeDefined();

      // Change password
      await userService.changePassword(registerResult.userId, testPassword, newPassword);

      // Verify old password no longer works
      await expect(
        authService.loginUser(testEmail, testPassword)
      ).rejects.toThrow('Invalid email or password');

      // Verify new password works
      const newLoginResult = await authService.loginUser(testEmail, newPassword);
      expect(newLoginResult.token).toBeDefined();
      expect(newLoginResult.user.email).toBe(testEmail);
    });
  });
});
