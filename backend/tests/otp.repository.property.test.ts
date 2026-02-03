import fc from 'fast-check';
import { OTPRepository } from '../src/repositories/otp.repository';
import { UserRepository } from '../src/repositories/user.repository';
import { pool } from '../src/config/database';

describe('OTPRepository Property Tests', () => {
  let otpRepository: OTPRepository;
  let userRepository: UserRepository;

  beforeAll(async () => {
    otpRepository = new OTPRepository();
    userRepository = new UserRepository();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await pool.query('DELETE FROM otps WHERE user_id IN (SELECT id FROM users WHERE email LIKE $1)', ['%@test.otp.property%']);
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.otp.property%']);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Feature: user-authentication, Property 7: OTP records have correct structure', () => {
    it('should create OTP records with correct structure for any valid OTP data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map(email => `${email.split('@')[0]}@test.otp.property.com`),
          fc.string({ minLength: 60, maxLength: 60 }), // bcrypt hash length
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          fc.integer({ min: 100000, max: 999999 }).map(n => n.toString()), // 6-digit OTP
          fc.integer({ min: 1, max: 15 }), // minutes until expiry
          async (email, passwordHash, fullName, phoneNumber, otpCode, expiryMinutes) => {
            // Create a test user
            const user = await userRepository.create({
              email,
              passwordHash,
              fullName,
              phoneNumber
            });

            // Create OTP with specific expiry time
            const expiresAt = new Date(Date.now() + expiryMinutes * 60 * 1000);
            const beforeCreate = new Date();

            await otpRepository.create({
              userId: user.id,
              otpCode,
              expiresAt
            });

            const afterCreate = new Date();

            // Retrieve the OTP record
            const otpRecord = await otpRepository.findByUserId(user.id);

            // Verify OTP record structure
            expect(otpRecord).toBeDefined();
            expect(otpRecord).not.toBeNull();
            
            if (otpRecord) {
              // Verify all required fields are present
              expect(otpRecord.id).toBeDefined();
              expect(typeof otpRecord.id).toBe('string');
              
              expect(otpRecord.userId).toBe(user.id);
              
              expect(otpRecord.otpCode).toBe(otpCode);
              expect(otpRecord.otpCode).toMatch(/^\d{6}$/); // 6-digit numeric
              
              expect(otpRecord.expiresAt).toBeDefined();
              expect(otpRecord.expiresAt instanceof Date).toBe(true);
              
              expect(otpRecord.createdAt).toBeDefined();
              expect(otpRecord.createdAt instanceof Date).toBe(true);
              
              // Verify created_at is within reasonable time window
              expect(otpRecord.createdAt.getTime()).toBeGreaterThanOrEqual(beforeCreate.getTime() - 1000);
              expect(otpRecord.createdAt.getTime()).toBeLessThanOrEqual(afterCreate.getTime() + 1000);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout
  });

  describe('Feature: user-authentication, Property 8: New OTPs invalidate previous OTPs', () => {
    it('should invalidate previous OTPs when a new OTP is generated', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map(email => `${email.split('@')[0]}@test.otp.property.com`),
          fc.string({ minLength: 60, maxLength: 60 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          fc.integer({ min: 100000, max: 999999 }).map(n => n.toString()), // First OTP
          fc.integer({ min: 100000, max: 999999 }).map(n => n.toString()), // Second OTP
          async (email, passwordHash, fullName, phoneNumber, firstOTP, secondOTP) => {
            // Create a test user
            const user = await userRepository.create({
              email,
              passwordHash,
              fullName,
              phoneNumber
            });

            // Create first OTP
            const firstExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await otpRepository.create({
              userId: user.id,
              otpCode: firstOTP,
              expiresAt: firstExpiresAt
            });

            // Verify first OTP exists
            const firstOTPRecord = await otpRepository.findByUserId(user.id);
            expect(firstOTPRecord).not.toBeNull();
            expect(firstOTPRecord?.otpCode).toBe(firstOTP);

            // Invalidate previous OTPs
            await otpRepository.invalidateUserOTPs(user.id);

            // Create second OTP
            const secondExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
            await otpRepository.create({
              userId: user.id,
              otpCode: secondOTP,
              expiresAt: secondExpiresAt
            });

            // Verify only the second OTP exists
            const currentOTPRecord = await otpRepository.findByUserId(user.id);
            expect(currentOTPRecord).not.toBeNull();
            expect(currentOTPRecord?.otpCode).toBe(secondOTP);
            expect(currentOTPRecord?.otpCode).not.toBe(firstOTP);
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout
  });
});
