import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

// Support both DATABASE_URL (common on Render) and individual variables
const getDatabaseConfig = () => {
  // If DATABASE_URL is provided, use it (Render style)
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false }
    };
  }
  
  // Otherwise, use individual variables (local development style)
  const isSupabase = process.env.DB_HOST && !process.env.DB_HOST.includes('localhost');
  
  return {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME || 'auraexpress_auth',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'postgres',
    // Enable SSL for Supabase, disable for local
    ssl: isSupabase ? { rejectUnauthorized: false } : false,
  };
};

export const pool = new Pool(getDatabaseConfig());

export const connectDatabase = async (): Promise<void> => {
  try {
    const client = await pool.connect();
    console.log('Database connected successfully');
    client.release();
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

export const disconnectDatabase = async (): Promise<void> => {
  await pool.end();
  console.log('Database connection closed');
};
