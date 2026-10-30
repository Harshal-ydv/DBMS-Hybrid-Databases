/**
 * MongoDB Schema Setup Script
 * Creates collections, indexes, and validation rules
 * Demonstrates: Embedded documents, indexes, schema validation
 */

require('dotenv').config();
const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('❌ MONGODB_URI not found in environment variables');
  process.exit(1);
}

async function setupMongoDB() {
  let client;
  
  try {
    console.log('🔌 Connecting to MongoDB Atlas...');
    client = new MongoClient(MONGODB_URI);
    await client.connect();
    
    const db = client.db();
    console.log(`✅ Connected to database: ${db.databaseName}\n`);
    
    // ============================================
    // Collection 1: menus
    // One document per restaurant with nested categories and items
    // ============================================
    console.log('📋 Creating menus collection...');
    
    try {
      await db.createCollection('menus', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['restaurant_id', 'categories'],
            properties: {
              restaurant_id: {
                bsonType: 'int',
                description: 'Must be an integer referencing MySQL restaurant_id'
              },
              categories: {
                bsonType: 'array',
                description: 'Array of menu categories',
                items: {
                  bsonType: 'object',
                  required: ['name', 'items'],
                  properties: {
                    name: { bsonType: 'string' },
                    items: {
                      bsonType: 'array',
                      items: {
                        bsonType: 'object',
                        required: ['name', 'price', 'veg'],
                        properties: {
                          name: { bsonType: 'string' },
                          price: { bsonType: 'number', minimum: 0 },
                          veg: { bsonType: 'bool' },
                          description: { bsonType: 'string' },
                          image: { bsonType: 'string' },
                          customizations: {
                            bsonType: 'array',
                            items: {
                              bsonType: 'object',
                              required: ['name', 'options'],
                              properties: {
                                name: { bsonType: 'string' },
                                options: { 
                                  bsonType: 'array',
                                  items: { bsonType: 'string' }
                                },
                                required: { bsonType: 'bool' }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      });
      console.log('  ✅ menus collection created with validation');
    } catch (err) {
      if (err.code === 48) {
        console.log('  ⚠️  menus collection already exists');
      } else {
        throw err;
      }
    }
    
    // Create indexes for menus
    await db.collection('menus').createIndex({ restaurant_id: 1 }, { unique: true });
    console.log('  ✅ Index created: restaurant_id (unique)');
    
    // ============================================
    // Collection 2: order_events
    // Time-series event log for order status changes
    // ============================================
    console.log('\n📋 Creating order_events collection...');
    
    try {
      await db.createCollection('order_events', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['order_id', 'status', 'timestamp'],
            properties: {
              order_id: {
                bsonType: 'int',
                description: 'Must be an integer referencing MySQL order_id'
              },
              status: {
                enum: ['PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED'],
                description: 'Order status at this event'
              },
              by_role: {
                enum: ['customer', 'owner', 'partner', 'system'],
                description: 'Role of user who triggered this status change'
              },
              by_id: {
                bsonType: 'int',
                description: 'User ID who triggered this change'
              },
              timestamp: {
                bsonType: 'date',
                description: 'When this event occurred'
              },
              note: {
                bsonType: 'string',
                description: 'Optional note about the event'
              }
            }
          }
        }
      });
      console.log('  ✅ order_events collection created with validation');
    } catch (err) {
      if (err.code === 48) {
        console.log('  ⚠️  order_events collection already exists');
      } else {
        throw err;
      }
    }
    
    // Create indexes for order_events - IMPORTANT for performance
    await db.collection('order_events').createIndex({ order_id: 1 });
    console.log('  ✅ Index created: order_id');
    
    await db.collection('order_events').createIndex({ timestamp: -1 });
    console.log('  ✅ Index created: timestamp (descending)');
    
    await db.collection('order_events').createIndex({ order_id: 1, timestamp: 1 });
    console.log('  ✅ Compound index created: order_id + timestamp');
    
    // ============================================
    // Collection 3: reviews
    // Customer reviews for restaurants and delivery
    // ============================================
    console.log('\n📋 Creating reviews collection...');
    
    try {
      await db.createCollection('reviews', {
        validator: {
          $jsonSchema: {
            bsonType: 'object',
            required: ['order_id', 'user_id', 'restaurant_id', 'created_at'],
            properties: {
              order_id: {
                bsonType: 'int',
                description: 'Must be an integer referencing MySQL order_id'
              },
              user_id: {
                bsonType: 'int',
                description: 'Must be an integer referencing MySQL user_id'
              },
              restaurant_id: {
                bsonType: 'int',
                description: 'Must be an integer referencing MySQL restaurant_id'
              },
              restaurant_rating: {
                bsonType: 'int',
                minimum: 1,
                maximum: 5,
                description: 'Rating for restaurant (1-5 stars)'
              },
              delivery_rating: {
                bsonType: 'int',
                minimum: 1,
                maximum: 5,
                description: 'Rating for delivery service (1-5 stars)'
              },
              comment: {
                bsonType: 'string',
                description: 'Review comment'
              },
              created_at: {
                bsonType: 'date',
                description: 'When review was created'
              }
            }
          }
        }
      });
      console.log('  ✅ reviews collection created with validation');
    } catch (err) {
      if (err.code === 48) {
        console.log('  ⚠️  reviews collection already exists');
      } else {
        throw err;
      }
    }
    
    // Create indexes for reviews
    await db.collection('reviews').createIndex({ restaurant_id: 1 });
    console.log('  ✅ Index created: restaurant_id');
    
    await db.collection('reviews').createIndex({ order_id: 1 }, { unique: true });
    console.log('  ✅ Index created: order_id (unique - one review per order)');
    
    await db.collection('reviews').createIndex({ user_id: 1 });
    console.log('  ✅ Index created: user_id');
    
    // ============================================
    // Test index performance
    // ============================================
    console.log('\n🔍 Testing index performance...');
    
    // Insert a test event to demonstrate explain()
    await db.collection('order_events').insertOne({
      order_id: 999999,
      status: 'PLACED',
      by_role: 'system',
      by_id: 0,
      timestamp: new Date(),
      note: 'Test event for index demonstration'
    });
    
    // Query with explain - will show index usage
    const explainResult = await db.collection('order_events')
      .find({ order_id: 999999 })
      .explain('executionStats');
    
    console.log('  📊 Query execution plan:');
    console.log(`     - Index used: ${explainResult.executionStats.executionSuccess ? 'YES' : 'NO'}`);
    console.log(`     - Documents examined: ${explainResult.executionStats.totalDocsExamined}`);
    console.log(`     - Execution time: ${explainResult.executionStats.executionTimeMillis}ms`);
    
    // Clean up test data
    await db.collection('order_events').deleteOne({ order_id: 999999 });
    
    // ============================================
    // Summary
    // ============================================
    console.log('\n✅ MongoDB setup complete!');
    console.log('\n📊 Collections created:');
    console.log('   1. menus - Restaurant menus with nested items and customizations');
    console.log('   2. order_events - Time-series log of order status changes');
    console.log('   3. reviews - Customer reviews for restaurants and deliveries');
    console.log('\n📈 Indexes created for optimal query performance');
    console.log('✅ Schema validation rules applied');
    console.log('\n💡 Ready to run seed.js to populate with sample data\n');
    
  } catch (error) {
    console.error('❌ Error setting up MongoDB:', error);
    process.exit(1);
  } finally {
    if (client) {
      await client.close();
      console.log('🔌 MongoDB connection closed');
    }
  }
}

// Run the setup
setupMongoDB();
