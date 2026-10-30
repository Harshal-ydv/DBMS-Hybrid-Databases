/**
 * Migration Script: Add WALLET and CASH to payment method ENUM
 * Fixes payment method mismatch between frontend and database
 */

const { getMySQLConnection } = require('../config/database');

async function fixPaymentMethods() {
  let connection;
  
  try {
    console.log('🔧 Starting payment method ENUM fix...');
    
    connection = await getMySQLConnection();
    
    // Alter the payments table to add WALLET and CASH
    await connection.query(`
      ALTER TABLE payments 
      MODIFY COLUMN method ENUM('UPI', 'CARD', 'COD', 'WALLET', 'CASH') NOT NULL
    `);
    
    console.log('✅ Payment method ENUM updated successfully!');
    console.log('   Valid methods: UPI, CARD, COD, WALLET, CASH');
    
  } catch (error) {
    console.error('❌ Error updating payment methods:', error.message);
    throw error;
  } finally {
    if (connection && connection.release) {
      connection.release();
    }
    process.exit(0);
  }
}

// Run the fix
fixPaymentMethods();
