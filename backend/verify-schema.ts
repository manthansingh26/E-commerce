import { pool, connectDatabase, disconnectDatabase } from './src/config/database';

async function verifySchema() {
  console.log('Verifying database schema...\n');
  
  try {
    await connectDatabase();
    
    // Check users table structure
    const usersColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'users'
      ORDER BY ordinal_position
    `);
    
    console.log('✓ Users table columns:');
    usersColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check otps table structure
    const otpsColumns = await pool.query(`
      SELECT column_name, data_type, is_nullable, column_default
      FROM information_schema.columns
      WHERE table_name = 'otps'
      ORDER BY ordinal_position
    `);
    
    console.log('\n✓ OTPs table columns:');
    otpsColumns.rows.forEach(col => {
      console.log(`  - ${col.column_name}: ${col.data_type} ${col.is_nullable === 'NO' ? '(NOT NULL)' : ''}`);
    });
    
    // Check indexes
    const indexes = await pool.query(`
      SELECT tablename, indexname
      FROM pg_indexes
      WHERE schemaname = 'public'
      AND tablename IN ('users', 'otps')
      ORDER BY tablename, indexname
    `);
    
    console.log('\n✓ Indexes:');
    indexes.rows.forEach(idx => {
      console.log(`  - ${idx.tablename}.${idx.indexname}`);
    });
    
    await disconnectDatabase();
    console.log('\n✓ Schema verification complete!');
    process.exit(0);
    
  } catch (error) {
    console.error('✗ Schema verification failed!');
    console.error('Error:', error);
    process.exit(1);
  }
}

verifySchema();
