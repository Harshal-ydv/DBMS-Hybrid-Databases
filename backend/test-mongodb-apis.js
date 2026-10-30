/**
 * Test script for MongoDB API endpoints
 * Tests menus, reviews, and events endpoints
 */

const BASE_URL = 'http://localhost:5000/api';

// Helper function for API calls
async function apiCall(method, endpoint, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  const response = await fetch(`${BASE_URL}${endpoint}`, options);
  const data = await response.json();
  return { status: response.status, data };
}

// Test functions
async function testMenuEndpoints() {
  console.log('\n📋 TESTING MENU ENDPOINTS\n' + '='.repeat(50));
  
  try {
    // 1. Get all menus
    console.log('\n1. GET /api/menus - Get all menus');
    const allMenus = await apiCall('GET', '/menus');
    console.log('Status:', allMenus.status);
    console.log('Menus found:', allMenus.data.length);
    
    // 2. Get menu for specific restaurant
    console.log('\n2. GET /api/menus/restaurant/:restaurantId - Get menu for restaurant 1');
    const restaurantMenu = await apiCall('GET', '/menus/restaurant/1');
    console.log('Status:', restaurantMenu.status);
    console.log('Restaurant:', restaurantMenu.data?.restaurant_name);
    console.log('Categories:', restaurantMenu.data?.categories?.length);
    
    // 3. Get popular items
    console.log('\n3. GET /api/menus/popular - Get popular items');
    const popularItems = await apiCall('GET', '/menus/popular?limit=5');
    console.log('Status:', popularItems.status);
    console.log('Popular items:', popularItems.data.length);
    if (popularItems.data.length > 0) {
      console.log('Top item:', popularItems.data[0]);
    }
    
    // 4. Search menu items
    console.log('\n4. GET /api/menus/search - Search for "pizza"');
    const searchResults = await apiCall('GET', '/menus/search?query=pizza');
    console.log('Status:', searchResults.status);
    console.log('Results found:', searchResults.data.length);
    
    // 5. Get vegetarian items
    console.log('\n5. GET /api/menus/dietary/vegetarian - Get vegetarian items');
    const vegItems = await apiCall('GET', '/menus/dietary/vegetarian');
    console.log('Status:', vegItems.status);
    console.log('Vegetarian items:', vegItems.data.length);
    
    console.log('\n✅ Menu endpoints test completed!');
  } catch (error) {
    console.error('❌ Menu endpoints test failed:', error.message);
  }
}

async function testReviewEndpoints() {
  console.log('\n⭐ TESTING REVIEW ENDPOINTS\n' + '='.repeat(50));
  
  try {
    // 1. Get all reviews for a restaurant
    console.log('\n1. GET /api/reviews/restaurant/:restaurantId - Get reviews for restaurant 1');
    const restaurantReviews = await apiCall('GET', '/reviews/restaurant/1');
    console.log('Status:', restaurantReviews.status);
    console.log('Reviews found:', restaurantReviews.data.length);
    
    // 2. Get restaurant rating summary
    console.log('\n2. GET /api/reviews/restaurant/:restaurantId/summary - Get rating summary');
    const ratingSummary = await apiCall('GET', '/reviews/restaurant/1/summary');
    console.log('Status:', ratingSummary.status);
    console.log('Summary:', ratingSummary.data);
    
    // 3. Get top-rated restaurants
    console.log('\n3. GET /api/reviews/top-rated - Get top-rated restaurants');
    const topRated = await apiCall('GET', '/reviews/top-rated?limit=5');
    console.log('Status:', topRated.status);
    console.log('Top restaurants:', topRated.data.length);
    if (topRated.data.length > 0) {
      console.log('Best rated:', topRated.data[0]);
    }
    
    // 4. Get recent reviews
    console.log('\n4. GET /api/reviews/recent - Get recent reviews');
    const recentReviews = await apiCall('GET', '/reviews/recent?limit=5');
    console.log('Status:', recentReviews.status);
    console.log('Recent reviews:', recentReviews.data.length);
    
    // 5. Create a new review
    console.log('\n5. POST /api/reviews - Create new review');
    const newReview = {
      order_id: 1,
      user_id: 1,
      restaurant_id: 1,
      rating: 5,
      comment: 'Excellent food and fast delivery! Highly recommended.',
      food_rating: 5,
      delivery_rating: 5,
      value_rating: 4
    };
    const createResult = await apiCall('POST', '/reviews', newReview);
    console.log('Status:', createResult.status);
    console.log('Result:', createResult.data);
    
    // 6. Get reviews by user
    console.log('\n6. GET /api/reviews/user/:userId - Get reviews by user 1');
    const userReviews = await apiCall('GET', '/reviews/user/1');
    console.log('Status:', userReviews.status);
    console.log('User reviews:', userReviews.data.length);
    
    console.log('\n✅ Review endpoints test completed!');
  } catch (error) {
    console.error('❌ Review endpoints test failed:', error.message);
  }
}

async function testEventEndpoints() {
  console.log('\n📊 TESTING EVENT ENDPOINTS\n' + '='.repeat(50));
  
  try {
    // 1. Get events for an order
    console.log('\n1. GET /api/events/order/:orderId - Get events for order 1');
    const orderEvents = await apiCall('GET', '/events/order/1');
    console.log('Status:', orderEvents.status);
    console.log('Events found:', orderEvents.data.length);
    
    // 2. Get order timeline
    console.log('\n2. GET /api/events/order/:orderId/timeline - Get timeline for order 1');
    const timeline = await apiCall('GET', '/events/order/1/timeline');
    console.log('Status:', timeline.status);
    console.log('Timeline events:', timeline.data.length);
    if (timeline.data.length > 0) {
      console.log('First event:', timeline.data[0]);
    }
    
    // 3. Get recent events
    console.log('\n3. GET /api/events/recent - Get recent events');
    const recentEvents = await apiCall('GET', '/events/recent?limit=10');
    console.log('Status:', recentEvents.status);
    console.log('Recent events:', recentEvents.data.length);
    
    // 4. Get delivery time analytics
    console.log('\n4. GET /api/events/analytics/delivery-time - Get delivery time analytics');
    const deliveryAnalytics = await apiCall('GET', '/events/analytics/delivery-time');
    console.log('Status:', deliveryAnalytics.status);
    console.log('Analytics:', deliveryAnalytics.data);
    
    // 5. Get status transition stats
    console.log('\n5. GET /api/events/analytics/status-transitions - Get status transition stats');
    const transitionStats = await apiCall('GET', '/events/analytics/status-transitions');
    console.log('Status:', transitionStats.status);
    console.log('Transition stats:', transitionStats.data.length);
    if (transitionStats.data.length > 0) {
      console.log('Sample:', transitionStats.data[0]);
    }
    
    // 6. Log a new event
    console.log('\n6. POST /api/events - Log new event');
    const newEvent = {
      order_id: 1,
      event_type: 'TEST_EVENT',
      status: 'PREPARING',
      metadata: {
        test: true,
        message: 'Test event from API test script'
      }
    };
    const logResult = await apiCall('POST', '/events', newEvent);
    console.log('Status:', logResult.status);
    console.log('Result:', logResult.data);
    
    console.log('\n✅ Event endpoints test completed!');
  } catch (error) {
    console.error('❌ Event endpoints test failed:', error.message);
  }
}

// Integration test - Create order and verify event logging
async function testOrderEventIntegration() {
  console.log('\n🔗 TESTING ORDER-EVENT INTEGRATION\n' + '='.repeat(50));
  
  try {
    // Create a new order
    console.log('\n1. Creating new order...');
    const newOrder = {
      user_id: 1,
      restaurant_id: 2,
      items: [
        { item_name: 'Burger', quantity: 2, price: 8.99 },
        { item_name: 'Fries', quantity: 1, price: 3.99 }
      ],
      delivery_address: '123 Test Street, City',
      payment_method: 'CARD',
      total_amount: 21.97
    };
    
    const orderResult = await apiCall('POST', '/orders', newOrder);
    console.log('Order created:', orderResult.data);
    
    if (orderResult.data.success) {
      const orderId = orderResult.data.data.orderId;
      
      // Wait a moment for event to be logged
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Check if event was logged
      console.log('\n2. Checking if ORDER_CREATED event was logged...');
      const events = await apiCall('GET', `/events/order/${orderId}`);
      console.log('Events found:', events.data.length);
      
      const createdEvent = events.data.find(e => e.event_type === 'ORDER_CREATED');
      if (createdEvent) {
        console.log('✅ ORDER_CREATED event found:', createdEvent);
      } else {
        console.log('⚠️  ORDER_CREATED event not found');
      }
    }
    
    console.log('\n✅ Integration test completed!');
  } catch (error) {
    console.error('❌ Integration test failed:', error.message);
  }
}

// Main test runner
async function runAllTests() {
  console.log('\n🚀 STARTING MONGODB API TESTS');
  console.log('='.repeat(50));
  console.log('Testing against:', BASE_URL);
  console.log('Make sure the server is running on port 5000\n');
  
  try {
    await testMenuEndpoints();
    await testReviewEndpoints();
    await testEventEndpoints();
    await testOrderEventIntegration();
    
    console.log('\n' + '='.repeat(50));
    console.log('🎉 ALL TESTS COMPLETED!');
    console.log('='.repeat(50) + '\n');
  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
  }
}

// Run tests
runAllTests();
