/**
 * Simple script to test database connections
 * Run this before starting the server to verify setup
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function testConnections() {
  console.log('🧪 Testing Database Connections...\n');
  
  // ============================================
  // Test MySQL Connection
  // ============================================
  console.log('📊 Testing MySQL (AWS RDS)...');
  try {
    const mysqlConfig = {
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    };
    
    console.log(`   Host: ${mysqlConfig.host}`);
    console.log(`   Database: ${mysqlConfig.database}`);
    
    const connection = await mysql.createConnection(mysqlConfig);
    console.log('   ✅ MySQL connected successfully!');
    
    // Test a simple query
    const [rows] = await connection.query('SELECT 1 AS test');
    console.log(`   ✅ Test query executed: ${rows[0].test}`);
    
    // Check if tables exist
    const [tables] = await connection.query('SHOW TABLES');
    if (tables.length > 0) {
      console.log(`   ✅ Found ${tables.length} tables in database`);
      tables.forEach(table => {
        console.log(`      - ${Object.values(table)[0]}`);
      });
    } else {
      console.log('   ⚠️  No tables found. Run schema.sql first!');
    }
    
    await connection.end();
    console.log('');
    
  } catch (error) {
    console.error('   ❌ MySQL connection failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('   💡 Troubleshooting:');
    console.error('   1. Check your .env file exists and has correct MySQL credentials');
    console.error('   2. Verify AWS RDS instance is running');
    console.error('   3. Check security group allows port 3306 from your IP');
    console.error('   4. Confirm endpoint URL is correct');
    console.error('');
    process.exit(1);
  }
  
  // ============================================
  // Test MongoDB Connection
  // ============================================
  console.log('📊 Testing MongoDB (Atlas)...');
  try {
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      throw new Error('MONGODB_URI not found in environment variables');
    }
    
    // Hide password in logs
    const safeUri = mongoUri.replace(/:([^:@]{8})[^:@]*@/, ':****@');
    console.log(`   Connection String: ${safeUri}`);
    
    const client = new MongoClient(mongoUri);
    await client.connect();
    console.log('   ✅ MongoDB connected successfully!');
    
    const db = client.db();
    console.log(`   ✅ Connected to database: ${db.databaseName}`);
    
    // List collections
    const collections = await db.listCollections().toArray();
    if (collections.length > 0) {
      console.log(`   ✅ Found ${collections.length} collections:`);
      collections.forEach(col => {
        console.log(`      - ${col.name}`);
      });
    } else {
      console.log('   ⚠️  No collections found. Run mongodb-setup.js first!');
    }
    
    await client.close();
    console.log('');
    
  } catch (error) {
    console.error('   ❌ MongoDB connection failed!');
    console.error('   Error:', error.message);
    console.error('');
    console.error('   💡 Troubleshooting:');
    console.error('   1. Check your .env file has correct MONGODB_URI');
    console.error('   2. Verify MongoDB Atlas cluster is running');
    console.error('   3. Check Network Access whitelist includes your IP');
    console.error('   4. Confirm database user has correct permissions');
    console.error('   5. Check password doesn\'t have unencoded special characters');
    console.error('');
    process.exit(1);
  }
  
  // ============================================
  // Success!
  // ============================================
  console.log('✅ All database connections successful!');
  console.log('');
  console.log('🎉 You can now:');
  console.log('   1. Run "node scripts/schema.sql" or use MySQL Workbench to create tables');
  console.log('   2. Run "node scripts/mongodb-setup.js" to create collections');
  console.log('   3. Run "node scripts/seed.js" to populate data');
  console.log('   4. Run "npm start" to start the backend server');
  console.log('');
}

testConnections();
