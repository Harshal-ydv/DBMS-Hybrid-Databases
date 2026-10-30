const mysql = require('mysql2/promise');
const config = require('../config/env');

async function addMissingColumns() {
  try {
    const connection = await mysql.createConnection({
      host: config.mysql.host,
      user: config.mysql.user,
      password: config.mysql.password,
      database: config.mysql.database
    });

    console.log('✅ Connected to MySQL');

    // Add phone column
    try {
      await connection.query('ALTER TABLE restaurants ADD COLUMN phone VARCHAR(20) AFTER address');
      console.log('✅ Added phone column');
    } catch (e) {
      console.log('ℹ️  Phone column already exists');
    }

    // Add rating column
    try {
      await connection.query('ALTER TABLE restaurants ADD COLUMN rating DECIMAL(3,2) DEFAULT 4.0 AFTER phone');
      console.log('✅ Added rating column');
    } catch (e) {
      console.log('ℹ️  Rating column already exists');
    }

    // Update restaurants with phone numbers
    await connection.query(`
      UPDATE restaurants 
      SET phone = CONCAT('555-', LPAD(restaurant_id * 1000, 4, '0'))
      WHERE phone IS NULL
    `);
    console.log('✅ Updated phone numbers');

    // Update restaurants with ratings
    await connection.query(`
      UPDATE restaurants 
      SET rating = 4.0 + (RAND() * 1.0)
      WHERE rating IS NULL OR rating = 0
    `);
    console.log('✅ Updated ratings');

    // Verify
    const [rows] = await connection.query('SELECT restaurant_id, name, phone, rating FROM restaurants');
    console.log('\n📊 Updated Restaurants:');
    rows.forEach(row => {
      console.log(`  ${row.name}: ${row.phone}, Rating: ${row.rating}`);
    });

    await connection.end();
    console.log('\n✅ All updates complete!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

addMissingColumns();
