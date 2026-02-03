export interface User {
  id: string;
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string;
  profilePicture?: string;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  phoneNumber: string;
  profilePicture?: string;
  createdAt: Date;
}

export interface CreateUserData {
  email: string;
  passwordHash: string;
  fullName: string;
  phoneNumber: string;
}
