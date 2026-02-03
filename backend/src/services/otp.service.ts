import { OTPRepository } from '../repositories/otp.repository';
import { config } from '../config/env';

export class OTPService {
  private readonly otpRepository: OTPRepository;
  private readonly expiryMinutes: number;
  private readonly resendWindowMinutes: number;

  constructor(otpRepository: OTPRepository) {
    this.otpRepository = otpRepository;
    this.expiryMinutes = config.otp.expiryMinutes;
    this.resendWindowMinutes = config.otp.resendWindowMinutes;
  }

  generateOTP(): string {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  async createOTPRecord(userId: string, otp: string): Promise<void> {
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + this.expiryMinutes);

    await this.otpRepository.create({
      userId,
      otpCode: otp,
      expiresAt
    });
  }

  async verifyOTP(userId: string, otp: string): Promise<boolean> {
    const otpRecord = await this.otpRepository.findByUserId(userId);

    if (!otpRecord) {
      return false;
    }

    if (otpRecord.otpCode !== otp) {
      return false;
    }

    const now = new Date();
    if (now > otpRecord.expiresAt) {
      return false;
    }

    return true;
  }

  async invalidateUserOTPs(userId: string): Promise<void> {
    await this.otpRepository.invalidateUserOTPs(userId);
  }

  async checkResendAttempts(userId: string): Promise<number> {
    return await this.otpRepository.countRecentAttempts(userId, this.resendWindowMinutes);
  }
}
