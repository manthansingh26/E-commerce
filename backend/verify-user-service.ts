import { UserRepository } from './src/repositories/user.repository';
import { UserService } from './src/services/user.service';
import { hashPassword } from './src/utils/password.utils';
import { pool } from './src/config/database';

async function verifyUserService() {
  console.log('🔍 Verifying UserService implementation...\n');

  const userRepository = new UserRepository();
  const userService = new UserService(userRepository);

  try {
    // Create a test user
    console.log('1. Creating test user...');
    const testUser = await userRepository.create({
      email: `test-${Date.now()}@example.com`,
      passwordHash: await hashPassword('TestPassword123'),
      fullName: 'Test User',
      phoneNumber: '+1234567890'
    });
    console.log('✅ Test user created:', testUser.id);

    // Test getUserProfile
    console.log('\n2. Testing getUserProfile...');
    const profile = await userService.getUserProfile(testUser.id);
    console.log('✅ Profile retrieved:', {
      id: profile.id,
      email: profile.email,
      fullName: profile.fullName,
      phoneNumber: profile.phoneNumber
    });
    
    // Verify password hash is not in profile
    if ('passwordHash' in profile) {
      console.log('❌ FAIL: Password hash should not be in profile');
    } else {
      console.log('✅ Password hash correctly excluded from profile');
    }

    // Test updateUserProfile
    console.log('\n3. Testing updateUserProfile...');
    const updatedProfile = await userService.updateUserProfile(testUser.id, {
      fullName: 'Updated Name',
      phoneNumber: '+9876543210'
    });
    console.log('✅ Profile updated:', {
      fullName: updatedProfile.fullName,
      phoneNumber: updatedProfile.phoneNumber
    });

    // Test email update rejection
    console.log('\n4. Testing email update rejection...');
    try {
      await userService.updateUserProfile(testUser.id, {
        email: 'newemail@example.com'
      } as any);
      console.log('❌ FAIL: Email update should be rejected');
    } catch (error: any) {
      console.log('✅ Email update correctly rejected:', error.message);
    }

    // Test changePassword
    console.log('\n5. Testing changePassword...');
    await userService.changePassword(testUser.id, 'TestPassword123', 'NewPassword456');
    console.log('✅ Password changed successfully');

    // Verify new password works
    console.log('\n6. Verifying new password...');
    const updatedUser = await userRepository.findById(testUser.id);
    const bcrypt = require('bcryptjs');
    const isValid = await bcrypt.compare('NewPassword456', updatedUser!.passwordHash);
    if (isValid) {
      console.log('✅ New password verified');
    } else {
      console.log('❌ FAIL: New password verification failed');
    }

    // Test changePassword with wrong current password
    console.log('\n7. Testing changePassword with wrong current password...');
    try {
      await userService.changePassword(testUser.id, 'WrongPassword', 'AnotherPassword');
      console.log('❌ FAIL: Should reject wrong current password');
    } catch (error: any) {
      console.log('✅ Wrong current password correctly rejected:', error.message);
    }

    // Cleanup
    console.log('\n8. Cleaning up test user...');
    await pool.query('DELETE FROM users WHERE id = $1', [testUser.id]);
    console.log('✅ Test user deleted');

    console.log('\n✅ All UserService tests passed!');
  } catch (error) {
    console.error('❌ Error during verification:', error);
    throw error;
  } finally {
    await pool.end();
  }
}

verifyUserService().catch(console.error);
