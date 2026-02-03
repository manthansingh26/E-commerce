import { pool } from '../config/database';
import { OTP, CreateOTPData } from '../models/otp.model';

export class OTPRepository {
  async create(otpData: CreateOTPData): Promise<void> {
    const query = `
      INSERT INTO otps (user_id, otp_code, expires_at)
      VALUES ($1, $2, $3)
    `;
    
    const values = [
      otpData.userId,
      otpData.otpCode,
      otpData.expiresAt
    ];

    await pool.query(query, values);
  }

  async findByUserId(userId: string): Promise<OTP | null> {
    const query = `
      SELECT id, user_id as "userId", otp_code as "otpCode", 
             expires_at as "expiresAt", created_at as "createdAt"
      FROM otps
      WHERE user_id = $1
      ORDER BY created_at DESC
      LIMIT 1
    `;
    
    const result = await pool.query(query, [userId]);
    return result.rows[0] || null;
  }

  async deleteByUserId(userId: string): Promise<void> {
    const query = `
      DELETE FROM otps
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  }

  async countRecentAttempts(userId: string, withinMinutes: number): Promise<number> {
    const query = `
      SELECT COUNT(*) as count
      FROM otps
      WHERE user_id = $1
        AND created_at > NOW() - INTERVAL '1 minute' * $2
    `;
    
    const result = await pool.query(query, [userId, withinMinutes]);
    return parseInt(result.rows[0].count, 10);
  }

  async invalidateUserOTPs(userId: string): Promise<void> {
    const query = `
      DELETE FROM otps
      WHERE user_id = $1
    `;
    
    await pool.query(query, [userId]);
  }
}
