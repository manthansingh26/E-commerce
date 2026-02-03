import api from '@/lib/api';
import { UserProfile } from './auth.service';

export interface ProfileUpdateData {
  fullName?: string;
  phoneNumber?: string;
  profilePicture?: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileUpdateResponse {
  user: UserProfile;
}

export interface MessageResponse {
  message: string;
}

const userService = {
  // Get user profile
  getProfile: async (): Promise<{ user: UserProfile }> => {
    const response = await api.get<{ user: UserProfile }>('/api/users/profile');
    return response.data;
  },

  // Update user profile
  updateProfile: async (data: ProfileUpdateData): Promise<ProfileUpdateResponse> => {
    const response = await api.put<ProfileUpdateResponse>('/api/users/profile', data);
    return response.data;
  },

  // Change password
  changePassword: async (data: ChangePasswordData): Promise<MessageResponse> => {
    const response = await api.put<MessageResponse>('/api/users/change-password', data);
    return response.data;
  },
};

export default userService;
