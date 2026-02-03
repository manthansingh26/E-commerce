import { UserRepository } from '../repositories/user.repository';
import { UserProfile } from '../models/user.model';
import { hashPassword, comparePassword } from '../utils/password.utils';

export interface ProfileUpdates {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export class UserService {
  private readonly userRepository: UserRepository;

  constructor(userRepository: UserRepository) {
    this.userRepository = userRepository;
  }

  async getUserProfile(userId: string): Promise<UserProfile> {
    // Fetch user by ID
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Return profile data excluding password hash
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };

    return userProfile;
  }

  async updateUserProfile(userId: string, updates: ProfileUpdates): Promise<UserProfile> {
    // Validate update data - reject email updates
    if ('email' in updates) {
      throw new Error('Email updates are not supported');
    }

    // Validate that at least one field is being updated
    if (!updates.fullName && !updates.phoneNumber && !updates.profilePicture) {
      throw new Error('No valid fields to update');
    }

    // Update allowed fields (fullName, phoneNumber, profilePicture)
    const updatedUser = await this.userRepository.update(userId, updates);

    if (!updatedUser) {
      throw new Error('User not found');
    }

    // Return updated profile
    const userProfile: UserProfile = {
      id: updatedUser.id,
      email: updatedUser.email,
      fullName: updatedUser.fullName,
      phoneNumber: updatedUser.phoneNumber,
      profilePicture: updatedUser.profilePicture,
      createdAt: updatedUser.createdAt
    };

    return userProfile;
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    // Fetch user to verify current password
    const user = await this.userRepository.findById(userId);
    
    if (!user) {
      throw new Error('User not found');
    }

    // Verify current password
    const isPasswordValid = await comparePassword(currentPassword, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    // Hash new password
    const newPasswordHash = await hashPassword(newPassword);

    // Update password hash in database
    await this.userRepository.update(userId, { passwordHash: newPasswordHash } as any);
  }
}
