import nodemailer, { Transporter } from 'nodemailer';
import { config } from '../config/env';

export interface EmailConfig {
  service: string;
  auth: {
    user: string;
    pass: string;
  };
}

export class EmailService {
  private transporter!: Transporter;

  constructor() {
    this.configure({
      service: config.email.service,
      auth: {
        user: config.email.user,
        pass: config.email.password
      }
    });
  }

  configure(emailConfig: EmailConfig): void {
    this.transporter = nodemailer.createTransport({
      service: emailConfig.service,
      auth: {
        user: emailConfig.auth.user,
        pass: emailConfig.auth.pass
      }
    });
  }

  async sendOTPEmail(email: string, otp: string): Promise<void> {
    // In development mode with invalid email config, log OTP to console
    if (process.env.NODE_ENV === 'development' && 
        (config.email.user === 'your_email@gmail.com' || !config.email.user)) {
      console.log('\n' + '='.repeat(50));
      console.log('📧 EMAIL SERVICE - DEVELOPMENT MODE');
      console.log('='.repeat(50));
      console.log(`To: ${email}`);
      console.log(`OTP Code: ${otp}`);
      console.log(`Expires: 10 minutes`);
      console.log('='.repeat(50) + '\n');
      return;
    }

    const mailOptions = {
      from: config.email.user,
      to: email,
      subject: 'AuraExpress - Email Verification OTP',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2>Email Verification</h2>
          <p>Thank you for registering with AuraExpress!</p>
          <p>Your One-Time Password (OTP) for email verification is:</p>
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; letter-spacing: 5px; margin: 20px 0;">
            ${otp}
          </div>
          <p><strong>Important:</strong> This OTP will expire in 10 minutes.</p>
          <p>If you did not request this verification, please ignore this email.</p>
          <hr style="margin: 30px 0; border: none; border-top: 1px solid #ddd;">
          <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
        </div>
      `
    };

    await this.transporter.sendMail(mailOptions);
  }
}
