import api from '@/lib/api';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export interface LoginData {
  email: string;
  password: string;
}

export interface VerifyOTPData {
  email: string;
  otp: string;
}

export interface ResendOTPData {
  email: string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  profilePicture?: string;
  createdAt: string;
}

export interface LoginResponse {
  token: string;
  user: UserProfile;
}

export interface RegisterResponse {
  message: string;
  userId: string;
}

export interface MessageResponse {
  message: string;
}

const authService = {
  // Register a new user
  register: async (data: RegisterData): Promise<RegisterResponse> => {
    const response = await api.post<RegisterResponse>('/api/auth/register', data);
    return response.data;
  },

  // Verify OTP
  verifyOTP: async (data: VerifyOTPData): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/auth/verify-otp', data);
    return response.data;
  },

  // Resend OTP
  resendOTP: async (data: ResendOTPData): Promise<MessageResponse> => {
    const response = await api.post<MessageResponse>('/api/auth/resend-otp', data);
    return response.data;
  },

  // Login user
  login: async (data: LoginData): Promise<LoginResponse> => {
    const response = await api.post<LoginResponse>('/api/auth/login', data);
    return response.data;
  },
};

export default authService;
