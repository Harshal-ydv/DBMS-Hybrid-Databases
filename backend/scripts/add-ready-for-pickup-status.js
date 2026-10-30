/**
 * Add READY_FOR_PICKUP status to orders table
 * Run this script to update the ENUM
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

const dbConfig = {
  host: process.env.MYSQL_HOST,
  user: process.env.MYSQL_USER,
  password: process.env.MYSQL_PASSWORD,
  database: process.env.MYSQL_DATABASE,
  port: process.env.MYSQL_PORT || 3306
};

async function addReadyForPickupStatus() {
  let connection;
  
  try {
    console.log('🔌 Connecting to MySQL...');
    connection = await mysql.createConnection(dbConfig);
    console.log('✅ Connected successfully\n');

    console.log('📝 Adding READY_FOR_PICKUP status to orders table...');
    
    // Alter the orders table to add the new status
    await connection.query(`
      ALTER TABLE orders 
      MODIFY COLUMN status ENUM(
        'PLACED', 
        'ACCEPTED', 
        'REJECTED', 
        'PREPARING', 
        'READY_FOR_PICKUP',
        'PICKED_UP', 
        'DELIVERED', 
        'CANCELLED'
      ) DEFAULT 'PLACED'
    `);
    
    console.log('✅ Successfully added READY_FOR_PICKUP status!\n');
    
    // Verify the change
    const [rows] = await connection.query(`
      SHOW COLUMNS FROM orders WHERE Field = 'status'
    `);
    
    console.log('📊 Current status ENUM values:');
    console.log(rows[0].Type);
    console.log('\n✅ Migration complete!');
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Connection closed');
    }
  }
}

// Run the migration
addReadyForPickupStatus();
