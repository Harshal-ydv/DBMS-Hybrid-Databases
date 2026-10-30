/**
 * Initialize MySQL Database
 * Creates tables, triggers, views, and stored procedures
 */

require('dotenv').config();
const mysql = require('mysql2/promise');

async function initDatabase() {
  let connection;
  
  try {
    console.log('📊 Connecting to MySQL...\n');
    
    connection = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      port: parseInt(process.env.MYSQL_PORT) || 3306,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE,
      multipleStatements: true
    });
    
    console.log('✅ Connected to MySQL\n');
    
    // Drop existing objects
    console.log('🗑️  Dropping existing objects if they exist...');
    await connection.query('DROP PROCEDURE IF EXISTS assign_partner');
    await connection.query('DROP PROCEDURE IF EXISTS complete_delivery');
    await connection.query('DROP VIEW IF EXISTS restaurant_revenue');
    await connection.query('DROP VIEW IF EXISTS top_customers');
    await connection.query('DROP VIEW IF EXISTS active_deliveries');
    await connection.query('DROP TRIGGER IF EXISTS cancel_order_on_refund');
    await connection.query('DROP TABLE IF EXISTS payments');
    await connection.query('DROP TABLE IF EXISTS order_items');
    await connection.query('DROP TABLE IF EXISTS orders');
    await connection.query('DROP TABLE IF EXISTS delivery_partners');
    await connection.query('DROP TABLE IF EXISTS restaurants');
    await connection.query('DROP TABLE IF EXISTS users');
    console.log('✅ Cleanup complete\n');
    
    // Create Tables
    console.log('📋 Creating tables...\n');
    
    // Users table
    await connection.query(`
      CREATE TABLE users (
        user_id INT PRIMARY KEY AUTO_INCREMENT,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        phone VARCHAR(15),
        password_hash VARCHAR(255),
        role ENUM('customer', 'owner', 'partner', 'admin') NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        INDEX idx_email (email),
        INDEX idx_role (role)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: users');
    
    // Restaurants table
    await connection.query(`
      CREATE TABLE restaurants (
        restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
        owner_id INT NOT NULL,
        name VARCHAR(100) NOT NULL,
        city VARCHAR(50),
        address TEXT,
        cuisine_type VARCHAR(50),
        is_open BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (owner_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_city (city),
        INDEX idx_cuisine (cuisine_type),
        INDEX idx_is_open (is_open)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: restaurants');
    
    // Delivery partners table
    await connection.query(`
      CREATE TABLE delivery_partners (
        partner_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT UNIQUE NOT NULL,
        vehicle_type VARCHAR(50),
        is_available BOOLEAN DEFAULT TRUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id) ON DELETE CASCADE,
        INDEX idx_available (is_available)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: delivery_partners');
    
    // Orders table
    await connection.query(`
      CREATE TABLE orders (
        order_id INT PRIMARY KEY AUTO_INCREMENT,
        user_id INT NOT NULL,
        restaurant_id INT NOT NULL,
        partner_id INT NULL,
        total_amount DECIMAL(10,2) NOT NULL,
        status ENUM('PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'PICKED_UP', 'DELIVERED', 'CANCELLED') DEFAULT 'PLACED',
        delivery_address TEXT NOT NULL,
        placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(user_id),
        FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
        FOREIGN KEY (partner_id) REFERENCES delivery_partners(partner_id) ON DELETE SET NULL,
        INDEX idx_user (user_id),
        INDEX idx_restaurant (restaurant_id),
        INDEX idx_partner (partner_id),
        INDEX idx_status (status),
        INDEX idx_placed_at (placed_at)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: orders');
    
    // Order items table
    await connection.query(`
      CREATE TABLE order_items (
        item_id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT NOT NULL,
        menu_item_id VARCHAR(24) NOT NULL COMMENT 'MongoDB ObjectId as string',
        item_name VARCHAR(100) NOT NULL,
        unit_price DECIMAL(8,2) NOT NULL,
        quantity INT NOT NULL DEFAULT 1,
        customizations TEXT COMMENT 'JSON string of selected customizations',
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        INDEX idx_order (order_id),
        INDEX idx_menu_item (menu_item_id)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: order_items');
    
    // Payments table
    await connection.query(`
      CREATE TABLE payments (
        payment_id INT PRIMARY KEY AUTO_INCREMENT,
        order_id INT UNIQUE NOT NULL,
        amount DECIMAL(10,2) NOT NULL,
        method ENUM('UPI', 'CARD', 'COD') NOT NULL,
        status ENUM('SUCCESS', 'FAILED', 'REFUNDED') DEFAULT 'SUCCESS',
        paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE,
        INDEX idx_status (status),
        INDEX idx_method (method)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
    console.log('  ✅ Created table: payments\n');
    
    // Create Trigger
    console.log('⚡ Creating trigger...\n');
    await connection.query(`
      CREATE TRIGGER cancel_order_on_refund
      AFTER UPDATE ON payments
      FOR EACH ROW
      BEGIN
        IF NEW.status = 'REFUNDED' AND OLD.status != 'REFUNDED' THEN
          UPDATE orders SET status = 'CANCELLED' WHERE order_id = NEW.order_id;
        END IF;
      END
    `);
    console.log('  ✅ Created trigger: cancel_order_on_refund\n');
    
    // Create Views
    console.log('👁️  Creating views...\n');
    
    await connection.query(`
      CREATE VIEW restaurant_revenue AS
      SELECT 
        r.restaurant_id,
        r.name AS restaurant_name,
        r.city,
        r.cuisine_type,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_revenue,
        COALESCE(AVG(o.total_amount), 0) AS avg_order_value
      FROM restaurants r
      LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id AND o.status = 'DELIVERED'
      GROUP BY r.restaurant_id, r.name, r.city, r.cuisine_type
      ORDER BY total_revenue DESC
    `);
    console.log('  ✅ Created view: restaurant_revenue');
    
    await connection.query(`
      CREATE VIEW top_customers AS
      SELECT 
        u.user_id,
        u.name,
        u.email,
        COUNT(o.order_id) AS total_orders,
        COALESCE(SUM(o.total_amount), 0) AS total_spent,
        COALESCE(AVG(o.total_amount), 0) AS avg_order_value
      FROM users u
      LEFT JOIN orders o ON u.user_id = o.user_id AND o.status = 'DELIVERED'
      WHERE u.role = 'customer'
      GROUP BY u.user_id, u.name, u.email
      HAVING total_orders > 0
      ORDER BY total_spent DESC
    `);
    console.log('  ✅ Created view: top_customers');
    
    await connection.query(`
      CREATE VIEW active_deliveries AS
      SELECT 
        o.order_id,
        o.status,
        o.total_amount,
        o.delivery_address,
        o.placed_at,
        r.name AS restaurant_name,
        r.address AS restaurant_address,
        u.name AS customer_name,
        u.phone AS customer_phone,
        dp.partner_id,
        du.name AS partner_name,
        du.phone AS partner_phone,
        dp.vehicle_type
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN users u ON o.user_id = u.user_id
      LEFT JOIN delivery_partners dp ON o.partner_id = dp.partner_id
      LEFT JOIN users du ON dp.user_id = du.user_id
      WHERE o.status IN ('PREPARING', 'PICKED_UP')
      ORDER BY o.placed_at ASC
    `);
    console.log('  ✅ Created view: active_deliveries\n');
    
    // Create Stored Procedures
    console.log('⚙️  Creating stored procedures...\n');
    
    await connection.query(`
      CREATE PROCEDURE assign_partner(IN p_order_id INT)
      BEGIN
        DECLARE v_partner_id INT DEFAULT NULL;
        DECLARE v_order_status VARCHAR(20);
        
        SELECT status INTO v_order_status
        FROM orders
        WHERE order_id = p_order_id;
        
        IF v_order_status IS NULL THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Order not found';
        END IF;
        
        IF v_order_status != 'ACCEPTED' THEN
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'Order must be in ACCEPTED status to assign partner';
        END IF;
        
        SELECT partner_id INTO v_partner_id
        FROM delivery_partners
        WHERE is_available = TRUE
        LIMIT 1;
        
        IF v_partner_id IS NOT NULL THEN
          START TRANSACTION;
          
          UPDATE orders 
          SET partner_id = v_partner_id,
              status = 'PREPARING'
          WHERE order_id = p_order_id;
          
          UPDATE delivery_partners 
          SET is_available = FALSE 
          WHERE partner_id = v_partner_id;
          
          COMMIT;
          
          SELECT v_partner_id AS assigned_partner_id, 'SUCCESS' AS result;
        ELSE
          SELECT NULL AS assigned_partner_id, 'NO_PARTNER_AVAILABLE' AS result;
        END IF;
      END
    `);
    console.log('  ✅ Created procedure: assign_partner');
    
    await connection.query(`
      CREATE PROCEDURE complete_delivery(IN p_order_id INT)
      BEGIN
        DECLARE v_partner_id INT;
        
        SELECT partner_id INTO v_partner_id
        FROM orders
        WHERE order_id = p_order_id;
        
        IF v_partner_id IS NOT NULL THEN
          START TRANSACTION;
          
          UPDATE orders 
          SET status = 'DELIVERED' 
          WHERE order_id = p_order_id;
          
          UPDATE delivery_partners 
          SET is_available = TRUE 
          WHERE partner_id = v_partner_id;
          
          COMMIT;
          
          SELECT 'SUCCESS' AS result, v_partner_id AS freed_partner_id;
        ELSE
          SIGNAL SQLSTATE '45000'
          SET MESSAGE_TEXT = 'No partner assigned to this order';
        END IF;
      END
    `);
    console.log('  ✅ Created procedure: complete_delivery\n');
    
    // Verify everything
    console.log('🔍 Verification...\n');
    
    const [tables] = await connection.query('SHOW TABLES');
    console.log(`✅ Tables created: ${tables.length}`);
    tables.forEach(table => console.log(`   - ${Object.values(table)[0]}`));
    
    const [triggers] = await connection.query('SHOW TRIGGERS');
    console.log(`\n✅ Triggers created: ${triggers.length}`);
    triggers.forEach(trigger => console.log(`   - ${trigger.Trigger}`));
    
    const [views] = await connection.query("SHOW FULL TABLES WHERE Table_type = 'VIEW'");
    console.log(`\n✅ Views created: ${views.length}`);
    views.forEach(view => console.log(`   - ${Object.values(view)[0]}`));
    
    const [procedures] = await connection.query('SHOW PROCEDURE STATUS WHERE Db = ?', [process.env.MYSQL_DATABASE]);
    console.log(`\n✅ Stored Procedures created: ${procedures.length}`);
    procedures.forEach(proc => console.log(`   - ${proc.Name}`));
    
    console.log('\n🎉 MySQL database initialization complete!');
    console.log('\n📝 Next steps:');
    console.log('   1. Fix MongoDB connection string');
    console.log('   2. Run: node scripts/mongodb-setup.js');
    console.log('   3. Run: node scripts/seed.js\n');
    
  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error('\nStack:', error.stack);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 MySQL connection closed');
    }
  }
}

initDatabase();
