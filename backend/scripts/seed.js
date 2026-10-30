/**
 * Seed Script for Food Delivery System
 * Populates both MySQL and MongoDB with realistic test data
 */

require('dotenv').config();
const mysql = require('mysql2/promise');
const { MongoClient, ObjectId } = require('mongodb');

const config = {
  mysql: {
    host: process.env.MYSQL_HOST,
    port: parseInt(process.env.MYSQL_PORT) || 3306,
    user: process.env.MYSQL_USER,
    password: process.env.MYSQL_PASSWORD,
    database: process.env.MYSQL_DATABASE
  },
  mongodb: {
    uri: process.env.MONGODB_URI
  }
};

async function seedDatabase() {
  let mysqlConn;
  let mongoClient;
  
  try {
    console.log('🌱 Starting database seeding process...\n');
    
    // ============================================
    // Connect to both databases
    // ============================================
    console.log('🔌 Connecting to MySQL...');
    mysqlConn = await mysql.createConnection(config.mysql);
    console.log('✅ MySQL connected\n');
    
    console.log('🔌 Connecting to MongoDB...');
    mongoClient = new MongoClient(config.mongodb.uri);
    await mongoClient.connect();
    const mongoDb = mongoClient.db();
    console.log('✅ MongoDB connected\n');
    
    // ============================================
    // MYSQL SEEDING
    // ============================================
    console.log('📊 Seeding MySQL database...');
    
    // Clear existing data (in correct order due to foreign keys)
    console.log('🗑️  Clearing existing MySQL data...');
    await mysqlConn.query('SET FOREIGN_KEY_CHECKS = 0');
    await mysqlConn.query('TRUNCATE TABLE payments');
    await mysqlConn.query('TRUNCATE TABLE order_items');
    await mysqlConn.query('TRUNCATE TABLE orders');
    await mysqlConn.query('TRUNCATE TABLE delivery_partners');
    await mysqlConn.query('TRUNCATE TABLE restaurants');
    await mysqlConn.query('TRUNCATE TABLE users');
    await mysqlConn.query('SET FOREIGN_KEY_CHECKS = 1');
    console.log('✅ MySQL tables cleared\n');
    
    // Seed Users
    console.log('👥 Seeding users...');
    const [usersResult] = await mysqlConn.query(`
      INSERT INTO users (name, email, phone, password_hash, role) VALUES
      ('Rahul Kumar', 'rahul@example.com', '9876543210', 'hash123', 'customer'),
      ('Priya Sharma', 'priya@example.com', '9876543211', 'hash123', 'customer'),
      ('Amit Patel', 'amit@example.com', '9876543212', 'hash123', 'customer'),
      ('Neha Singh', 'neha@example.com', '9876543213', 'hash123', 'owner'),
      ('Vikram Reddy', 'vikram@example.com', '9876543214', 'hash123', 'owner'),
      ('Sanjay Gupta', 'sanjay@example.com', '9876543215', 'hash123', 'owner'),
      ('Arjun Mehta', 'arjun@example.com', '9876543216', 'hash123', 'partner'),
      ('Deepak Yadav', 'deepak@example.com', '9876543217', 'hash123', 'partner'),
      ('Ravi Verma', 'ravi@example.com', '9876543218', 'hash123', 'partner'),
      ('Admin User', 'admin@fooddelivery.com', '9876543219', 'hash123', 'admin')
    `);
    console.log(`  ✅ ${usersResult.affectedRows} users created`);
    
    // Seed Restaurants
    console.log('🍽️  Seeding restaurants...');
    const [restaurantsResult] = await mysqlConn.query(`
      INSERT INTO restaurants (owner_id, name, city, address, cuisine_type, is_open) VALUES
      (4, 'Pizza Palace', 'Mumbai', '123 MG Road, Andheri West', 'Italian', TRUE),
      (5, 'Spice Garden', 'Mumbai', '456 SV Road, Bandra', 'Indian', TRUE),
      (6, 'Dragon Wok', 'Mumbai', '789 Link Road, Santacruz', 'Chinese', TRUE),
      (4, 'Burger Hub', 'Mumbai', '321 Linking Road, Khar', 'American', TRUE),
      (5, 'Taco Fiesta', 'Mumbai', '654 Hill Road, Bandra', 'Mexican', TRUE)
    `);
    console.log(`  ✅ ${restaurantsResult.affectedRows} restaurants created`);
    
    // Seed Delivery Partners
    console.log('🏍️  Seeding delivery partners...');
    const [partnersResult] = await mysqlConn.query(`
      INSERT INTO delivery_partners (user_id, vehicle_type, is_available) VALUES
      (7, 'Bike', TRUE),
      (8, 'Scooter', TRUE),
      (9, 'Bike', FALSE)
    `);
    console.log(`  ✅ ${partnersResult.affectedRows} delivery partners created\n`);
    
    // ============================================
    // MONGODB SEEDING
    // ============================================
    console.log('📊 Seeding MongoDB database...');
    
    // Clear existing MongoDB data
    console.log('🗑️  Clearing existing MongoDB data...');
    await mongoDb.collection('menus').deleteMany({});
    await mongoDb.collection('order_events').deleteMany({});
    await mongoDb.collection('reviews').deleteMany({});
    console.log('✅ MongoDB collections cleared\n');
    
    // Seed Menus with realistic food items
    console.log('📋 Seeding menus...');
    
    const menus = [
      // Pizza Palace Menu
      {
        restaurant_id: 1,
        categories: [
          {
            name: 'Pizzas',
            items: [
              {
                _id: new ObjectId(),
                name: 'Margherita Pizza',
                price: 249,
                veg: true,
                description: 'Classic pizza with tomato sauce and mozzarella',
                image: 'https://images.unsplash.com/photo-1574071318508-1cdbab80d002',
                customizations: [
                  { name: 'Size', options: ['Small (8")', 'Medium (10")', 'Large (12")'], required: true },
                  { name: 'Extra Cheese', options: ['No', 'Yes (+₹50)'], required: false },
                  { name: 'Toppings', options: ['Olives', 'Mushrooms', 'Onions', 'Peppers'], required: false }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Pepperoni Pizza',
                price: 349,
                veg: false,
                description: 'Loaded with pepperoni and mozzarella',
                image: 'https://images.unsplash.com/photo-1628840042765-356cda07504e',
                customizations: [
                  { name: 'Size', options: ['Small (8")', 'Medium (10")', 'Large (12")'], required: true },
                  { name: 'Extra Cheese', options: ['No', 'Yes (+₹50)'], required: false }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Veggie Supreme',
                price: 299,
                veg: true,
                description: 'Loaded with fresh vegetables',
                image: 'https://images.unsplash.com/photo-1571997478779-2adcbbe9ab2f',
                customizations: [
                  { name: 'Size', options: ['Small (8")', 'Medium (10")', 'Large (12")'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Sides',
            items: [
              {
                _id: new ObjectId(),
                name: 'Garlic Bread',
                price: 99,
                veg: true,
                description: 'Crispy garlic bread with herbs',
                image: 'https://images.unsplash.com/photo-1573140401552-3fab0b24f4e7',
                customizations: [
                  { name: 'Cheese', options: ['Plain', 'With Cheese (+₹30)'], required: true }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'French Fries',
                price: 79,
                veg: true,
                description: 'Crispy golden fries',
                image: 'https://images.unsplash.com/photo-1576107232684-1279f390859a',
                customizations: [
                  { name: 'Size', options: ['Regular', 'Large (+₹30)'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Beverages',
            items: [
              {
                _id: new ObjectId(),
                name: 'Coca Cola',
                price: 50,
                veg: true,
                description: 'Chilled Coke',
                image: 'https://images.unsplash.com/photo-1554866585-cd94860890b7',
                customizations: [
                  { name: 'Size', options: ['300ml', '500ml (+₹20)', '1L (+₹40)'], required: true }
                ]
              }
            ]
          }
        ]
      },
      
      // Spice Garden Menu
      {
        restaurant_id: 2,
        categories: [
          {
            name: 'Curries',
            items: [
              {
                _id: new ObjectId(),
                name: 'Paneer Butter Masala',
                price: 249,
                veg: true,
                description: 'Rich and creamy paneer curry',
                image: 'https://images.unsplash.com/photo-1631452180519-c014fe946bc7',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true },
                  { name: 'Extra Gravy', options: ['No', 'Yes (+₹30)'], required: false }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Chicken Tikka Masala',
                price: 299,
                veg: false,
                description: 'Grilled chicken in spicy tomato sauce',
                image: 'https://images.unsplash.com/photo-1565557623262-b51c2513a641',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Dal Makhani',
                price: 199,
                veg: true,
                description: 'Creamy black lentils',
                image: 'https://images.unsplash.com/photo-1546833999-b9f581a1996d',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Breads',
            items: [
              {
                _id: new ObjectId(),
                name: 'Butter Naan',
                price: 40,
                veg: true,
                description: 'Soft butter naan',
                image: 'https://images.unsplash.com/photo-1601050690597-df0568f70950',
                customizations: []
              },
              {
                _id: new ObjectId(),
                name: 'Garlic Naan',
                price: 50,
                veg: true,
                description: 'Naan with garlic and herbs',
                image: 'https://images.unsplash.com/photo-1630384678625-1e9bcb5cab13',
                customizations: []
              }
            ]
          },
          {
            name: 'Rice',
            items: [
              {
                _id: new ObjectId(),
                name: 'Veg Biryani',
                price: 199,
                veg: true,
                description: 'Aromatic basmati rice with vegetables',
                image: 'https://images.unsplash.com/photo-1563379091339-03b21ab4a4f8',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true },
                  { name: 'Raita', options: ['No Raita', 'With Raita (+₹30)'], required: false }
                ]
              }
            ]
          }
        ]
      },
      
      // Dragon Wok Menu
      {
        restaurant_id: 3,
        categories: [
          {
            name: 'Noodles',
            items: [
              {
                _id: new ObjectId(),
                name: 'Veg Hakka Noodles',
                price: 179,
                veg: true,
                description: 'Stir-fried noodles with vegetables',
                image: 'https://images.unsplash.com/photo-1585032226651-759b368d7246',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Chicken Schezwan Noodles',
                price: 219,
                veg: false,
                description: 'Spicy noodles with chicken',
                image: 'https://images.unsplash.com/photo-1612874742237-6526221588e3',
                customizations: [
                  { name: 'Spice Level', options: ['Medium', 'Hot', 'Extra Hot'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Fried Rice',
            items: [
              {
                _id: new ObjectId(),
                name: 'Veg Fried Rice',
                price: 169,
                veg: true,
                description: 'Classic fried rice with vegetables',
                image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Starters',
            items: [
              {
                _id: new ObjectId(),
                name: 'Spring Rolls',
                price: 149,
                veg: true,
                description: 'Crispy vegetable spring rolls',
                image: 'https://images.unsplash.com/photo-1541529086526-db283c563270',
                customizations: [
                  { name: 'Quantity', options: ['4 pieces', '6 pieces (+₹50)', '8 pieces (+₹100)'], required: true }
                ]
              }
            ]
          }
        ]
      },
      
      // Burger Hub Menu
      {
        restaurant_id: 4,
        categories: [
          {
            name: 'Burgers',
            items: [
              {
                _id: new ObjectId(),
                name: 'Classic Veggie Burger',
                price: 149,
                veg: true,
                description: 'Veggie patty with fresh veggies',
                image: 'https://images.unsplash.com/photo-1520072959219-c595dc870360',
                customizations: [
                  { name: 'Size', options: ['Regular', 'Large (+₹50)'], required: true },
                  { name: 'Cheese', options: ['No Cheese', 'Add Cheese (+₹30)'], required: false },
                  { name: 'Make it a Meal', options: ['Burger Only', 'With Fries & Drink (+₹80)'], required: false }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Chicken Burger',
                price: 199,
                veg: false,
                description: 'Grilled chicken patty with lettuce and mayo',
                image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd',
                customizations: [
                  { name: 'Size', options: ['Regular', 'Large (+₹50)'], required: true },
                  { name: 'Make it a Meal', options: ['Burger Only', 'With Fries & Drink (+₹80)'], required: false }
                ]
              }
            ]
          },
          {
            name: 'Sides',
            items: [
              {
                _id: new ObjectId(),
                name: 'Cheese Fries',
                price: 119,
                veg: true,
                description: 'Fries loaded with cheese sauce',
                image: 'https://images.unsplash.com/photo-1630431341973-02e1f23d96a9',
                customizations: []
              }
            ]
          }
        ]
      },
      
      // Taco Fiesta Menu
      {
        restaurant_id: 5,
        categories: [
          {
            name: 'Tacos',
            items: [
              {
                _id: new ObjectId(),
                name: 'Veg Tacos',
                price: 179,
                veg: true,
                description: 'Soft tacos with beans and veggies',
                image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b',
                customizations: [
                  { name: 'Quantity', options: ['2 Tacos', '3 Tacos (+₹60)', '4 Tacos (+₹120)'], required: true },
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              },
              {
                _id: new ObjectId(),
                name: 'Chicken Tacos',
                price: 229,
                veg: false,
                description: 'Soft tacos with grilled chicken',
                image: 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47',
                customizations: [
                  { name: 'Quantity', options: ['2 Tacos', '3 Tacos (+₹70)', '4 Tacos (+₹140)'], required: true },
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              }
            ]
          },
          {
            name: 'Burritos',
            items: [
              {
                _id: new ObjectId(),
                name: 'Bean Burrito',
                price: 199,
                veg: true,
                description: 'Wrapped tortilla with beans and cheese',
                image: 'https://images.unsplash.com/photo-1626700051175-6818013e1d4f',
                customizations: [
                  { name: 'Spice Level', options: ['Mild', 'Medium', 'Hot'], required: true }
                ]
              }
            ]
          }
        ]
      }
    ];
    
    const menusResult = await mongoDb.collection('menus').insertMany(menus);
    console.log(`  ✅ ${menusResult.insertedCount} restaurant menus created`);
    
    // Store menu item IDs for creating orders
    const allMenuItems = [];
    menus.forEach(menu => {
      menu.categories.forEach(category => {
        category.items.forEach(item => {
          allMenuItems.push({
            menuItemId: item._id.toString(),
            restaurantId: menu.restaurant_id,
            itemName: item.name,
            price: item.price
          });
        });
      });
    });
    
    // ============================================
    // Seed Orders with realistic data
    // ============================================
    console.log('📦 Seeding orders...');
    
    const ordersData = [
      // Order 1 - Completed order
      { user_id: 1, restaurant_id: 1, partner_id: 1, total_amount: 598, status: 'DELIVERED', delivery_address: '101, Palm Heights, Andheri West, Mumbai 400058' },
      // Order 2 - In progress
      { user_id: 2, restaurant_id: 2, partner_id: 2, total_amount: 538, status: 'PICKED_UP', delivery_address: '202, Sea View Apartments, Bandra West, Mumbai 400050' },
      // Order 3 - Waiting for pickup
      { user_id: 3, restaurant_id: 3, partner_id: 3, total_amount: 398, status: 'PREPARING', delivery_address: '303, Green Valley, Santacruz, Mumbai 400054' },
      // Order 4 - Just accepted
      { user_id: 1, restaurant_id: 4, partner_id: null, total_amount: 348, status: 'ACCEPTED', delivery_address: '101, Palm Heights, Andheri West, Mumbai 400058' },
      // Order 5 - Just placed
      { user_id: 2, restaurant_id: 5, partner_id: null, total_amount: 458, status: 'PLACED', delivery_address: '202, Sea View Apartments, Bandra West, Mumbai 400050' },
      // Order 6 - Completed
      { user_id: 3, restaurant_id: 1, partner_id: 1, total_amount: 448, status: 'DELIVERED', delivery_address: '303, Green Valley, Santacruz, Mumbai 400054' },
      // Order 7 - Delivered
      { user_id: 1, restaurant_id: 2, partner_id: 2, total_amount: 488, status: 'DELIVERED', delivery_address: '101, Palm Heights, Andheri West, Mumbai 400058' },
    ];
    
    for (const orderData of ordersData) {
      const [orderResult] = await mysqlConn.query(
        'INSERT INTO orders (user_id, restaurant_id, partner_id, total_amount, status, delivery_address) VALUES (?, ?, ?, ?, ?, ?)',
        [orderData.user_id, orderData.restaurant_id, orderData.partner_id, orderData.total_amount, orderData.status, orderData.delivery_address]
      );
      
      const orderId = orderResult.insertId;
      
      // Add order items for this order
      const restaurantItems = allMenuItems.filter(item => item.restaurantId === orderData.restaurant_id);
      const numItems = Math.floor(Math.random() * 2) + 1; // 1-2 items per order
      
      for (let i = 0; i < numItems; i++) {
        const item = restaurantItems[Math.floor(Math.random() * restaurantItems.length)];
        const quantity = Math.floor(Math.random() * 2) + 1;
        
        await mysqlConn.query(
          'INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity) VALUES (?, ?, ?, ?, ?)',
          [orderId, item.menuItemId, item.itemName, item.price, quantity]
        );
      }
      
      // Add payment for this order
      const paymentMethods = ['UPI', 'CARD', 'COD'];
      const method = paymentMethods[Math.floor(Math.random() * paymentMethods.length)];
      
      await mysqlConn.query(
        'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
        [orderId, orderData.total_amount, method, 'SUCCESS']
      );
    }
    
    console.log(`  ✅ ${ordersData.length} orders created with items and payments\n`);
    
    // ============================================
    // Seed Order Events (MongoDB)
    // ============================================
    console.log('📝 Seeding order events...');
    
    const orderEvents = [
      // Order 1 - Complete journey
      { order_id: 1, status: 'PLACED', by_role: 'customer', by_id: 1, timestamp: new Date('2024-10-20T10:00:00Z'), note: 'Order placed' },
      { order_id: 1, status: 'ACCEPTED', by_role: 'owner', by_id: 4, timestamp: new Date('2024-10-20T10:05:00Z'), note: 'Restaurant accepted order' },
      { order_id: 1, status: 'PREPARING', by_role: 'owner', by_id: 4, timestamp: new Date('2024-10-20T10:10:00Z'), note: 'Food preparation started' },
      { order_id: 1, status: 'PICKED_UP', by_role: 'partner', by_id: 7, timestamp: new Date('2024-10-20T10:35:00Z'), note: 'Picked up from restaurant' },
      { order_id: 1, status: 'DELIVERED', by_role: 'partner', by_id: 7, timestamp: new Date('2024-10-20T11:00:00Z'), note: 'Delivered to customer' },
      
      // Order 2 - Currently being delivered
      { order_id: 2, status: 'PLACED', by_role: 'customer', by_id: 2, timestamp: new Date('2024-10-20T12:00:00Z'), note: 'Order placed' },
      { order_id: 2, status: 'ACCEPTED', by_role: 'owner', by_id: 5, timestamp: new Date('2024-10-20T12:03:00Z'), note: 'Restaurant accepted order' },
      { order_id: 2, status: 'PREPARING', by_role: 'owner', by_id: 5, timestamp: new Date('2024-10-20T12:08:00Z'), note: 'Food preparation started' },
      { order_id: 2, status: 'PICKED_UP', by_role: 'partner', by_id: 8, timestamp: new Date('2024-10-20T12:40:00Z'), note: 'Out for delivery' },
      
      // Order 3 - Being prepared
      { order_id: 3, status: 'PLACED', by_role: 'customer', by_id: 3, timestamp: new Date('2024-10-20T13:00:00Z'), note: 'Order placed' },
      { order_id: 3, status: 'ACCEPTED', by_role: 'owner', by_id: 6, timestamp: new Date('2024-10-20T13:02:00Z'), note: 'Restaurant accepted order' },
      { order_id: 3, status: 'PREPARING', by_role: 'owner', by_id: 6, timestamp: new Date('2024-10-20T13:05:00Z'), note: 'Preparing your food' },
      
      // Order 4 - Just accepted
      { order_id: 4, status: 'PLACED', by_role: 'customer', by_id: 1, timestamp: new Date('2024-10-20T14:00:00Z'), note: 'Order placed' },
      { order_id: 4, status: 'ACCEPTED', by_role: 'owner', by_id: 4, timestamp: new Date('2024-10-20T14:02:00Z'), note: 'Restaurant accepted order' },
      
      // Order 5 - Just placed
      { order_id: 5, status: 'PLACED', by_role: 'customer', by_id: 2, timestamp: new Date('2024-10-20T14:30:00Z'), note: 'Order placed' },
      
      // Order 6 - Completed
      { order_id: 6, status: 'PLACED', by_role: 'customer', by_id: 3, timestamp: new Date('2024-10-19T18:00:00Z'), note: 'Order placed' },
      { order_id: 6, status: 'ACCEPTED', by_role: 'owner', by_id: 4, timestamp: new Date('2024-10-19T18:03:00Z'), note: 'Restaurant accepted order' },
      { order_id: 6, status: 'PREPARING', by_role: 'owner', by_id: 4, timestamp: new Date('2024-10-19T18:08:00Z'), note: 'Food preparation started' },
      { order_id: 6, status: 'PICKED_UP', by_role: 'partner', by_id: 7, timestamp: new Date('2024-10-19T18:35:00Z'), note: 'Picked up from restaurant' },
      { order_id: 6, status: 'DELIVERED', by_role: 'partner', by_id: 7, timestamp: new Date('2024-10-19T19:00:00Z'), note: 'Delivered successfully' },
      
      // Order 7 - Completed
      { order_id: 7, status: 'PLACED', by_role: 'customer', by_id: 1, timestamp: new Date('2024-10-18T20:00:00Z'), note: 'Order placed' },
      { order_id: 7, status: 'ACCEPTED', by_role: 'owner', by_id: 5, timestamp: new Date('2024-10-18T20:02:00Z'), note: 'Restaurant accepted order' },
      { order_id: 7, status: 'PREPARING', by_role: 'owner', by_id: 5, timestamp: new Date('2024-10-18T20:05:00Z'), note: 'Food preparation started' },
      { order_id: 7, status: 'PICKED_UP', by_role: 'partner', by_id: 8, timestamp: new Date('2024-10-18T20:30:00Z'), note: 'Out for delivery' },
      { order_id: 7, status: 'DELIVERED', by_role: 'partner', by_id: 8, timestamp: new Date('2024-10-18T20:55:00Z'), note: 'Delivered successfully' },
    ];
    
    const eventsResult = await mongoDb.collection('order_events').insertMany(orderEvents);
    console.log(`  ✅ ${eventsResult.insertedCount} order events created`);
    
    // ============================================
    // Seed Reviews (MongoDB)
    // ============================================
    console.log('⭐ Seeding reviews...');
    
    const reviews = [
      {
        order_id: 1,
        user_id: 1,
        restaurant_id: 1,
        restaurant_rating: 5,
        delivery_rating: 5,
        comment: 'Excellent pizza! Hot and fresh delivery.',
        created_at: new Date('2024-10-20T11:30:00Z')
      },
      {
        order_id: 6,
        user_id: 3,
        restaurant_id: 1,
        restaurant_rating: 4,
        delivery_rating: 4,
        comment: 'Good taste, delivery was a bit slow.',
        created_at: new Date('2024-10-19T19:30:00Z')
      },
      {
        order_id: 7,
        user_id: 1,
        restaurant_id: 2,
        restaurant_rating: 5,
        delivery_rating: 5,
        comment: 'Amazing paneer butter masala! Perfect spice level.',
        created_at: new Date('2024-10-18T21:30:00Z')
      }
    ];
    
    const reviewsResult = await mongoDb.collection('reviews').insertMany(reviews);
    console.log(`  ✅ ${reviewsResult.insertedCount} reviews created\n`);
    
    // ============================================
    // Summary
    // ============================================
    console.log('✅ Database seeding complete!\n');
    console.log('📊 Summary:');
    console.log('   MySQL:');
    console.log('     - 10 users (3 customers, 3 owners, 3 partners, 1 admin)');
    console.log('     - 5 restaurants (different cuisines)');
    console.log('     - 3 delivery partners');
    console.log('     - 7 orders in various states');
    console.log('     - Order items and payments\n');
    console.log('   MongoDB:');
    console.log('     - 5 restaurant menus with multiple categories');
    console.log('     - 24+ order status events');
    console.log('     - 3 customer reviews\n');
    console.log('🎉 Ready to test the application!\n');
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  } finally {
    if (mysqlConn) {
      await mysqlConn.end();
      console.log('🔌 MySQL connection closed');
    }
    if (mongoClient) {
      await mongoClient.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the seeding
seedDatabase();
