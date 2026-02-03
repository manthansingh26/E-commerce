import { pool, connectDatabase, disconnectDatabase } from './src/config/database';

async function testConnection() {
  console.log('Testing database connection...\n');
  
  try {
    // Test connection
    await connectDatabase();
    
    // Try a simple query
    const result = await pool.query('SELECT NOW() as current_time, version() as pg_version');
    
    console.log('✓ Database connection successful!');
    console.log('✓ Current time:', result.rows[0].current_time);
    console.log('✓ PostgreSQL version:', result.rows[0].pg_version);
    
    // Check if our tables exist
    const tablesResult = await pool.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_name IN ('users', 'otps')
      ORDER BY table_name
    `);
    
    console.log('\n✓ Tables found:', tablesResult.rows.map(r => r.table_name).join(', ') || 'None (run schema.sql to create tables)');
    
    await disconnectDatabase();
    console.log('\n✓ Connection closed successfully');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Database connection failed!');
    console.error('Error:', error);
    console.error('\nPlease check:');
    console.error('1. PostgreSQL is running');
    console.error('2. Database credentials in .env file are correct');
    console.error('3. Database exists (run: createdb auraexpress_auth)');
    process.exit(1);
  }
}

testConnection();
