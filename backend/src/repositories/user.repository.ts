import { pool } from '../config/database';
import { User, CreateUserData } from '../models/user.model';

export class UserRepository {
  async create(userData: CreateUserData): Promise<User> {
    const query = `
      INSERT INTO users (email, password_hash, full_name, phone_number, is_verified)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING id, email, password_hash as "passwordHash", full_name as "fullName", 
                phone_number as "phoneNumber", profile_picture as "profilePicture", 
                is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;
    
    const values = [
      userData.email,
      userData.passwordHash,
      userData.fullName,
      userData.phoneNumber,
      false
    ];

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async findByEmail(email: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
             phone_number as "phoneNumber", profile_picture as "profilePicture",
             is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE email = $1
    `;
    
    const result = await pool.query(query, [email]);
    return result.rows[0] || null;
  }

  async findById(id: string): Promise<User | null> {
    const query = `
      SELECT id, email, password_hash as "passwordHash", full_name as "fullName",
             phone_number as "phoneNumber", profile_picture as "profilePicture",
             is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
      FROM users
      WHERE id = $1
    `;
    
    const result = await pool.query(query, [id]);
    return result.rows[0] || null;
  }

  async update(id: string, updates: Partial<User>): Promise<User> {
    const allowedFields = ['fullName', 'phoneNumber', 'profilePicture', 'passwordHash'];
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    Object.entries(updates).forEach(([key, value]) => {
      if (allowedFields.includes(key) && value !== undefined) {
        const dbField = key === 'fullName' ? 'full_name' 
                      : key === 'phoneNumber' ? 'phone_number'
                      : key === 'profilePicture' ? 'profile_picture'
                      : key === 'passwordHash' ? 'password_hash'
                      : key;
        updateFields.push(`${dbField} = $${paramIndex}`);
        values.push(value);
        paramIndex++;
      }
    });

    if (updateFields.length === 0) {
      return this.findById(id) as Promise<User>;
    }

    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);
    values.push(id);

    const query = `
      UPDATE users
      SET ${updateFields.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING id, email, password_hash as "passwordHash", full_name as "fullName",
                phone_number as "phoneNumber", profile_picture as "profilePicture",
                is_verified as "isVerified", created_at as "createdAt", updated_at as "updatedAt"
    `;

    const result = await pool.query(query, values);
    return result.rows[0];
  }

  async setVerified(id: string): Promise<void> {
    const query = `
      UPDATE users
      SET is_verified = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
    `;
    
    await pool.query(query, [true, id]);
  }
}
