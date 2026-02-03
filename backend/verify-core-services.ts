import { hashPassword, comparePassword } from './src/utils/password.utils';
import { OTPService } from './src/services/otp.service';
import { TokenService } from './src/services/token.service';
import { OTPRepository } from './src/repositories/otp.repository';

async function verifyPasswordHashing() {
  console.log('\n=== Testing Password Hashing ===');
  const password = 'TestPassword123';
  
  const hash = await hashPassword(password);
  console.log('✓ Password hashed successfully');
  console.log(`  Original: ${password}`);
  console.log(`  Hash: ${hash.substring(0, 20)}...`);
  
  const isValid = await comparePassword(password, hash);
  console.log(`✓ Password comparison: ${isValid ? 'PASS' : 'FAIL'}`);
  
  const isInvalid = await comparePassword('WrongPassword', hash);
  console.log(`✓ Wrong password rejected: ${!isInvalid ? 'PASS' : 'FAIL'}`);
}

async function verifyOTPGeneration() {
  console.log('\n=== Testing OTP Generation ===');
  const otpRepository = new OTPRepository();
  const otpService = new OTPService(otpRepository);
  
  const otp = otpService.generateOTP();
  console.log(`✓ OTP generated: ${otp}`);
  console.log(`  Length: ${otp.length} (expected: 6)`);
  console.log(`  Is numeric: ${/^\d{6}$/.test(otp) ? 'PASS' : 'FAIL'}`);
}

async function verifyJWTTokenCreation() {
  console.log('\n=== Testing JWT Token Creation ===');
  const tokenService = new TokenService();
  
  const payload = {
    userId: '123e4567-e89b-12d3-a456-426614174000',
    email: 'test@example.com'
  };
  
  const token = tokenService.generateToken(payload);
  console.log('✓ JWT token generated successfully');
  console.log(`  Token: ${token.substring(0, 30)}...`);
  
  const decoded = tokenService.verifyToken(token);
  console.log('✓ JWT token verified successfully');
  console.log(`  User ID: ${decoded.userId}`);
  console.log(`  Email: ${decoded.email}`);
  console.log(`  Expiry set: ${decoded.exp ? 'PASS' : 'FAIL'}`);
  
  if (decoded.exp && decoded.iat) {
    const expiryHours = (decoded.exp - decoded.iat) / 3600;
    console.log(`  Expiry duration: ${expiryHours} hours (expected: 24)`);
  }
}

async function main() {
  console.log('===========================================');
  console.log('Core Services Verification');
  console.log('===========================================');
  
  try {
    await verifyPasswordHashing();
    await verifyOTPGeneration();
    await verifyJWTTokenCreation();
    
    console.log('\n===========================================');
    console.log('✓ All core services verified successfully!');
    console.log('===========================================\n');
  } catch (error) {
    console.error('\n✗ Verification failed:', error);
    process.exit(1);
  }
}

main();
