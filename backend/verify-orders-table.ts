import { pool } from './src/config/database';

async function verifyOrdersTables() {
  try {
    console.log('🔍 Checking database tables...\n');

    // Check if orders table exists
    const ordersTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'orders'
      );
    `);
    console.log('✓ Orders table exists:', ordersTableCheck.rows[0].exists);

    // Check if order_items table exists
    const orderItemsTableCheck = await pool.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'order_items'
      );
    `);
    console.log('✓ Order items table exists:', orderItemsTableCheck.rows[0].exists);

    // Count orders
    const ordersCount = await pool.query('SELECT COUNT(*) FROM orders');
    console.log('\n📊 Total orders in database:', ordersCount.rows[0].count);

    // Count order items
    const itemsCount = await pool.query('SELECT COUNT(*) FROM order_items');
    console.log('📊 Total order items in database:', itemsCount.rows[0].count);

    // Check users
    const usersCount = await pool.query('SELECT COUNT(*) FROM users');
    console.log('📊 Total users in database:', usersCount.rows[0].count);

    // Get user info
    const users = await pool.query('SELECT id, email, full_name, is_verified FROM users');
    console.log('\n👥 Users:');
    users.rows.forEach(user => {
      console.log(`  - ${user.email} (${user.full_name}) - Verified: ${user.is_verified}`);
    });

    await pool.end();
    console.log('\n✅ Database verification complete');
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verifyOrdersTables();
