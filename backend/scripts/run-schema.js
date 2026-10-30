/**
 * Script to execute MySQL schema
 * Runs the schema.sql file against the database
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

async function runSchema() {
  let connection;
  
  try {
    console.log('📊 Connecting to MySQL...');
    
    const config = {
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true  // Important: allows running multiple SQL statements
    };
    
    connection = await mysql.createConnection(config);
    console.log('✅ Connected to MySQL\n');
    
    // Read schema.sql file
    const schemaPath = path.join(__dirname, 'schema.sql');
    console.log('📖 Reading schema.sql...');
    let sql = fs.readFileSync(schemaPath, 'utf8');
    
    // Split by delimiter to handle stored procedures and triggers
    console.log('🔧 Executing schema...\n');
    
    // Execute the schema
    // Note: We need to handle DELIMITER statements differently
    const statements = sql.split(';').filter(stmt => stmt.trim().length > 0);
    
    let successCount = 0;
    let isInDelimiter = false;
    let delimiterBlock = '';
    
    for (let i = 0; i < statements.length; i++) {
      let statement = statements[i].trim();
      
      // Skip comments and empty lines
      if (!statement || statement.startsWith('--')) continue;
      
      // Check for DELIMITER commands
      if (statement.includes('DELIMITER $$')) {
        isInDelimiter = true;
        delimiterBlock = '';
        continue;
      }
      
      if (statement.includes('DELIMITER ;')) {
        isInDelimiter = false;
        if (delimiterBlock.trim()) {
          try {
            // Execute the stored procedure/trigger
            await connection.query(delimiterBlock);
            successCount++;
            console.log(`  ✅ Created procedure/trigger`);
          } catch (err) {
            if (!err.message.includes('already exists')) {
              console.error(`  ⚠️  Warning: ${err.message}`);
            }
          }
        }
        delimiterBlock = '';
        continue;
      }
      
      if (isInDelimiter) {
        delimiterBlock += statement + ';';
        continue;
      }
      
      // Execute regular statement
      try {
        if (statement.includes('DROP')) {
          // Skip DROP statements on first run
          continue;
        }
        
        await connection.query(statement + ';');
        successCount++;
        
        // Show what was created
        if (statement.includes('CREATE TABLE')) {
          const tableName = statement.match(/CREATE TABLE\s+(\w+)/i)?.[1];
          console.log(`  ✅ Created table: ${tableName}`);
        } else if (statement.includes('CREATE VIEW')) {
          const viewName = statement.match(/CREATE VIEW\s+(\w+)/i)?.[1];
          console.log(`  ✅ Created view: ${viewName}`);
        } else if (statement.includes('CREATE TRIGGER')) {
          const triggerName = statement.match(/CREATE TRIGGER\s+(\w+)/i)?.[1];
          console.log(`  ✅ Created trigger: ${triggerName}`);
        }
      } catch (err) {
        if (err.code === 'ER_TABLE_EXISTS_ERROR') {
          // Table already exists, that's okay
        } else if (err.message.includes('already exists')) {
          // Object already exists
        } else {
          console.error(`  ⚠️  Error: ${err.message}`);
        }
      }
    }
    
    console.log(`\n✅ Schema execution completed! (${successCount} operations)\n`);
    
    // Verify tables were created
    console.log('🔍 Verifying tables...');
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Found ${tables.length} tables:`);
    tables.forEach(table => {
      console.log(`   - ${Object.values(table)[0]}`);
    });
    
    // Check triggers
    console.log('\n🔍 Checking triggers...');
    const [triggers] = await connection.query('SHOW TRIGGERS');
    console.log(`✅ Found ${triggers.length} trigger(s):`);
    triggers.forEach(trigger => {
      console.log(`   - ${trigger.Trigger}`);
    });
    
    // Check procedures
    console.log('\n🔍 Checking stored procedures...');
    const [procedures] = await connection.query('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.MYSQL_DATABASE]);
    console.log(`✅ Found ${procedures.length} stored procedure(s):`);
    procedures.forEach(proc => {
      console.log(`   - ${proc.Name}`);
    });
    
    console.log('\n🎉 Database schema is ready!');
    console.log('📝 Next step: Run "node scripts/mongodb-setup.js"\n');
    
  } catch (error) {
    console.error('❌ Error running schema:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

runSchema();
