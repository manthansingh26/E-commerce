export interface OTP {
  id: string;
  userId: string;
  otpCode: string;
  expiresAt: Date;
  createdAt: Date;
}

export interface CreateOTPData {
  userId: string;
  otpCode: string;
  expiresAt: Date;
}
