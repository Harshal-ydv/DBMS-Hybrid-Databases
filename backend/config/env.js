require('dotenv').config();

const config = {
  // MySQL Configuration
  mysql: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  },

  // MongoDB Configuration
  mongodb: {
    uri: process.env.MONGODB_URI
  },

  // Server Configuration
  server: {
    port: parseInt(process.env.PORT) || 5000,
    env: process.env.NODE_ENV || 'development'
  }
};

// Validate required environment variables
const requiredEnvVars = [
  'MYSQL_HOST',
  'MYSQL_USER',
  'MYSQL_PASSWORD',
  'MYSQL_DATABASE',
  'MONGODB_URI'
];

const missingVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingVars.length > 0) {
  console.error('❌ Missing required environment variables:', missingVars.join(', '));
  console.error('Please create a .env file based on .env.example');
  process.exit(1);
}

module.exports = config;
