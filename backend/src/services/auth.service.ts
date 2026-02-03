import { UserRepository } from '../repositories/user.repository';
import { OTPService } from './otp.service';
import { EmailService } from './email.service';
import { TokenService } from './token.service';
import { hashPassword, comparePassword } from '../utils/password.utils';
import { UserProfile } from '../models/user.model';

export interface RegisterData {
  email: string;
  password: string;
  fullName: string;
  phoneNumber: string;
}

export class AuthService {
  private readonly userRepository: UserRepository;
  private readonly otpService: OTPService;
  private readonly emailService: EmailService;
  private readonly tokenService: TokenService;

  constructor(
    userRepository: UserRepository,
    otpService: OTPService,
    emailService: EmailService,
    tokenService: TokenService
  ) {
    this.userRepository = userRepository;
    this.otpService = otpService;
    this.emailService = emailService;
    this.tokenService = tokenService;
  }

  async registerUser(data: RegisterData): Promise<{ userId: string }> {
    // Validate input data
    if (!data.email || !data.password || !data.fullName || !data.phoneNumber) {
      throw new Error('Missing required fields');
    }

    // Check for duplicate email
    const existingUser = await this.userRepository.findByEmail(data.email);
    if (existingUser) {
      throw new Error('Email already registered');
    }

    // Hash password
    const passwordHash = await hashPassword(data.password);

    // Create user with is_verified=false
    const user = await this.userRepository.create({
      email: data.email,
      passwordHash,
      fullName: data.fullName,
      phoneNumber: data.phoneNumber
    });

    // Generate and store OTP
    const otp = this.otpService.generateOTP();
    await this.otpService.createOTPRecord(user.id, otp);

    // Send OTP email
    await this.emailService.sendOTPEmail(data.email, otp);

    return { userId: user.id };
  }

  async verifyUserOTP(email: string, otp: string): Promise<void> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Verify OTP matches and not expired
    const isValid = await this.otpService.verifyOTP(user.id, otp);
    if (!isValid) {
      throw new Error('Invalid or expired OTP');
    }

    // Set user is_verified=true
    await this.userRepository.setVerified(user.id);

    // Delete OTP record
    await this.otpService.invalidateUserOTPs(user.id);
  }

  async resendOTP(email: string): Promise<void> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('User not found');
    }

    // Check resend attempts (max 3 per hour)
    const attempts = await this.otpService.checkResendAttempts(user.id);
    if (attempts >= 3) {
      throw new Error('Maximum OTP resend attempts exceeded. Please try again later.');
    }

    // Invalidate old OTPs
    await this.otpService.invalidateUserOTPs(user.id);

    // Generate new OTP
    const otp = this.otpService.generateOTP();
    await this.otpService.createOTPRecord(user.id, otp);

    // Send new OTP email
    await this.emailService.sendOTPEmail(email, otp);
  }

  async loginUser(email: string, password: string): Promise<{ token: string; user: UserProfile }> {
    // Find user by email
    const user = await this.userRepository.findByEmail(email);
    if (!user) {
      throw new Error('Invalid email or password');
    }

    // Check is_verified=true
    if (!user.isVerified) {
      throw new Error('Email verification required');
    }

    // Compare password with hash
    const isPasswordValid = await comparePassword(password, user.passwordHash);
    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    // Generate JWT token
    const token = this.tokenService.generateToken({
      userId: user.id,
      email: user.email
    });

    // Return token and user profile (exclude password hash)
    const userProfile: UserProfile = {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      profilePicture: user.profilePicture,
      createdAt: user.createdAt
    };

    return { token, user: userProfile };
  }
}
