const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');
const config = require('./env');

// MySQL Connection Pool
let mysqlPool = null;

const getMySQLConnection = async () => {
  if (!mysqlPool) {
    try {
      mysqlPool = mysql.createPool(config.mysql);
      console.log('✅ MySQL connection pool created');
      
      // Test the connection
      const connection = await mysqlPool.getConnection();
      console.log('✅ MySQL connected successfully to:', config.mysql.host);
      connection.release();
    } catch (error) {
      console.error('❌ MySQL connection failed:', error.message);
      throw error;
    }
  }
  return mysqlPool;
};

// MongoDB Connection
let mongoClient = null;
let mongoDb = null;

const getMongoConnection = async () => {
  if (!mongoClient) {
    try {
      mongoClient = new MongoClient(config.mongodb.uri, {
        maxPoolSize: 10,
        minPoolSize: 2,
        retryWrites: true,
        retryReads: true
      });
      
      await mongoClient.connect();
      mongoDb = mongoClient.db();
      console.log('✅ MongoDB connected successfully to:', mongoDb.databaseName);
    } catch (error) {
      console.error('❌ MongoDB connection failed:', error.message);
      throw error;
    }
  }
  return { client: mongoClient, db: mongoDb };
};

// Graceful shutdown
const closeConnections = async () => {
  try {
    if (mysqlPool) {
      await mysqlPool.end();
      console.log('🔌 MySQL connection pool closed');
    }
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
  } catch (error) {
    console.error('Error closing connections:', error);
  }
};

// Handle process termination
process.on('SIGINT', async () => {
  console.log('\n🛑 Received SIGINT, closing connections...');
  await closeConnections();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🛑 Received SIGTERM, closing connections...');
  await closeConnections();
  process.exit(0);
});

module.exports = {
  getMySQLConnection,
  getMongoConnection,
  closeConnections
};
