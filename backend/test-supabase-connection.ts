/**
 * Test Supabase Database Connection
 * 
 * This script tests the connection to Supabase database
 * Run: npx ts-node test-supabase-connection.ts
 */

import { Pool } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const testConnection = async () => {
  console.log('🔍 Testing Supabase Connection...\n');
  
  // Display connection details (hide password)
  console.log('Connection Details:');
  console.log('------------------');
  console.log(`Host: ${process.env.DB_HOST}`);
  console.log(`Port: ${process.env.DB_PORT}`);
  console.log(`Database: ${process.env.DB_NAME}`);
  console.log(`User: ${process.env.DB_USER}`);
  console.log(`Password: ${'*'.repeat(process.env.DB_PASSWORD?.length || 0)}`);
  console.log('');

  const pool = new Pool({
    host: process.env.DB_HOST,
    port: parseInt(process.env.DB_PORT || '5432'),
    database: process.env.DB_NAME,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    ssl: process.env.DB_HOST !== 'localhost' ? { rejectUnauthorized: false } : false
  });

  try {
    // Test connection
    console.log('📡 Connecting to database...');
    const client = await pool.connect();
    console.log('✅ Connection successful!\n');

    // Test query - Get database version
    console.log('🔍 Testing query...');
    const versionResult = await client.query('SELECT version()');
    console.log('✅ Query successful!');
    console.log(`Database: ${versionResult.rows[0].version.split(',')[0]}\n`);

    // Check if tables exist
    console.log('📋 Checking tables...');
    const tablesResult = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);

    if (tablesResult.rows.length === 0) {
      console.log('⚠️  No tables found!');
      console.log('   Run backend/schema.sql in Supabase SQL Editor to create tables.\n');
    } else {
      console.log('✅ Tables found:');
      tablesResult.rows.forEach((row, index) => {
        console.log(`   ${index + 1}. ${row.table_name}`);
      });
      console.log('');
    }

    // Count records in each table
    if (tablesResult.rows.length > 0) {
      console.log('📊 Record counts:');
      for (const row of tablesResult.rows) {
        try {
          const countResult = await client.query(`SELECT COUNT(*) FROM ${row.table_name}`);
          console.log(`   ${row.table_name}: ${countResult.rows[0].count} records`);
        } catch (error) {
          console.log(`   ${row.table_name}: Error counting records`);
        }
      }
      console.log('');
    }

    client.release();
    await pool.end();

    console.log('🎉 All tests passed!');
    console.log('✅ Your backend is ready to connect to Supabase!\n');

  } catch (error: any) {
    console.error('❌ Connection failed!\n');
    console.error('Error details:');
    console.error('-------------');
    console.error(`Message: ${error.message}`);
    console.error(`Code: ${error.code || 'N/A'}`);
    console.error('');
    
    // Provide helpful suggestions
    console.log('💡 Troubleshooting tips:');
    console.log('----------------------');
    
    if (error.code === 'ENOTFOUND') {
      console.log('❌ Host not found');
      console.log('   → Check DB_HOST in .env file');
      console.log('   → Make sure you copied the correct host from Supabase');
    } else if (error.code === 'ETIMEDOUT' || error.code === 'ECONNREFUSED') {
      console.log('❌ Connection timeout');
      console.log('   → Check your internet connection');
      console.log('   → Verify Supabase project is active (not paused)');
      console.log('   → Check if DB_PORT is correct (should be 5432)');
    } else if (error.message.includes('password authentication failed')) {
      console.log('❌ Authentication failed');
      console.log('   → Check DB_PASSWORD in .env file');
      console.log('   → Make sure there are no extra spaces');
      console.log('   → Try resetting password in Supabase dashboard');
    } else if (error.message.includes('database') && error.message.includes('does not exist')) {
      console.log('❌ Database not found');
      console.log('   → Change DB_NAME to "postgres" in .env file');
      console.log('   → Supabase uses "postgres" as default database name');
    } else {
      console.log('❌ Unknown error');
      console.log('   → Check all environment variables in .env file');
      console.log('   → Review SUPABASE_LOCAL_SETUP.md for detailed setup');
    }
    
    console.log('');
    process.exit(1);
  }
};

// Run the test
testConnection();
