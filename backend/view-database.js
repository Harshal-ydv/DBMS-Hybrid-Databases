/**
 * View Database Contents
 * Quick script to see all your data
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { MongoClient } = require('mongodb');

async function viewDatabases() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 FOOD DELIVERY SYSTEM - DATABASE VIEWER');
  console.log('='.repeat(60) + '\n');

  // ========== MySQL Data ==========
  console.log('🔷 MySQL (AWS RDS) - Transactional Data\n');
  
  try {
    const mysqlConn = await mysql.createConnection({
      host: process.env.MYSQL_HOST,
      user: process.env.MYSQL_USER,
      password: process.env.MYSQL_PASSWORD,
      database: process.env.MYSQL_DATABASE
    });

    // Restaurants
    const [restaurants] = await mysqlConn.query('SELECT restaurant_id, name, cuisine_type, rating, phone FROM restaurants');
    console.log('📍 RESTAURANTS (' + restaurants.length + ')');
    console.table(restaurants);

    // Users
    const [users] = await mysqlConn.query('SELECT user_id, name, email, role FROM users');
    console.log('\n👥 USERS (' + users.length + ')');
    console.table(users);

    // Recent Orders
    const [orders] = await mysqlConn.query(`
      SELECT o.order_id, o.user_id, o.restaurant_id, o.status, 
             o.total_amount, DATE_FORMAT(o.placed_at, '%Y-%m-%d %H:%i') as placed_at
      FROM orders o
      ORDER BY o.placed_at DESC
      LIMIT 10
    `);
    console.log('\n📦 RECENT ORDERS (Last 10)');
    console.table(orders);

    // Order Items for last order
    if (orders.length > 0) {
      const [items] = await mysqlConn.query(
        'SELECT item_name, unit_price, quantity FROM order_items WHERE order_id = ?',
        [orders[0].order_id]
      );
      console.log('\n🛒 ITEMS IN ORDER #' + orders[0].order_id);
      console.table(items);
    }

    // Delivery Partners
    const [partners] = await mysqlConn.query(`
      SELECT dp.partner_id, u.name, dp.vehicle_type, dp.is_available
      FROM delivery_partners dp
      JOIN users u ON dp.user_id = u.user_id
    `);
    console.log('\n🏍️ DELIVERY PARTNERS (' + partners.length + ')');
    console.table(partners);

    await mysqlConn.end();

  } catch (error) {
    console.error('❌ MySQL Error:', error.message);
  }

  console.log('\n' + '='.repeat(60) + '\n');

  // ========== MongoDB Data ==========
  console.log('🔶 MongoDB (Local) - Flexible Schema Data\n');

  try {
    const mongoClient = await MongoClient.connect(process.env.MONGODB_URI);
    const db = mongoClient.db('food_delivery');

    // Menus
    const menusCount = await db.collection('menus').countDocuments();
    console.log('📋 MENUS: ' + menusCount);
    const menus = await db.collection('menus').find().limit(3).toArray();
    menus.forEach(menu => {
      console.log(`\n   Restaurant ID: ${menu.restaurant_id}`);
      console.log(`   Categories: ${menu.categories?.length || 0}`);
      menu.categories?.forEach(cat => {
        console.log(`      - ${cat.name}: ${cat.items?.length || 0} items`);
      });
    });

    // Reviews
    const reviewsCount = await db.collection('reviews').countDocuments();
    console.log(`\n⭐ REVIEWS: ${reviewsCount}`);
    const reviews = await db.collection('reviews').find().limit(5).toArray();
    reviews.forEach(review => {
      console.log(`   Order #${review.order_id}: ${review.rating}/5 - "${review.comment?.substring(0, 50)}..."`);
    });

    // Events
    const eventsCount = await db.collection('order_events').countDocuments();
    console.log(`\n📊 ORDER EVENTS: ${eventsCount}`);
    const recentEvents = await db.collection('order_events')
      .find()
      .sort({ timestamp: -1 })
      .limit(5)
      .toArray();
    console.log('\n   Recent Activity:');
    recentEvents.forEach(event => {
      const date = new Date(event.timestamp).toLocaleString();
      console.log(`   ${date} - Order #${event.order_id}: ${event.status}`);
    });

    await mongoClient.close();

  } catch (error) {
    console.error('❌ MongoDB Error:', error.message);
  }

  console.log('\n' + '='.repeat(60));
  console.log('✅ Database viewing complete!');
  console.log('='.repeat(60) + '\n');
}

viewDatabases();
