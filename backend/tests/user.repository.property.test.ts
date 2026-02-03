import fc from 'fast-check';
import { UserRepository } from '../src/repositories/user.repository';
import { pool } from '../src/config/database';

describe('UserRepository Property Tests', () => {
  let userRepository: UserRepository;

  beforeAll(async () => {
    userRepository = new UserRepository();
  });

  afterEach(async () => {
    // Clean up test data after each test
    await pool.query('DELETE FROM users WHERE email LIKE $1', ['%@test.property%']);
  });

  afterAll(async () => {
    await pool.end();
  });

  describe('Feature: user-authentication, Property 1: New accounts are inactive', () => {
    it('should create inactive accounts for any valid registration data', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map(email => `${email.split('@')[0]}@test.property.com`),
          fc.string({ minLength: 60, maxLength: 60 }), // bcrypt hash length
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          async (email, passwordHash, fullName, phoneNumber) => {
            const user = await userRepository.create({
              email,
              passwordHash,
              fullName,
              phoneNumber
            });

            expect(user).toBeDefined();
            expect(user.isVerified).toBe(false);
            expect(user.email).toBe(email);
            expect(user.fullName).toBe(fullName);
            expect(user.phoneNumber).toBe(phoneNumber);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Feature: user-authentication, Property 3: Duplicate emails are rejected', () => {
    it('should reject duplicate email registrations', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.emailAddress().map(email => `${email.split('@')[0]}@test.property.com`),
          fc.string({ minLength: 60, maxLength: 60 }),
          fc.string({ minLength: 2, maxLength: 100 }),
          fc.string({ minLength: 10, maxLength: 15 }).map(s => '+1' + s.replace(/\D/g, '').slice(0, 10)),
          async (email, passwordHash, fullName, phoneNumber) => {
            // Create first user
            await userRepository.create({
              email,
              passwordHash,
              fullName,
              phoneNumber
            });

            // Attempt to create duplicate user with same email
            await expect(
              userRepository.create({
                email,
                passwordHash: passwordHash + 'different',
                fullName: fullName + ' Different',
                phoneNumber: phoneNumber + '1'
              })
            ).rejects.toThrow();
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property-based test
  });
});
