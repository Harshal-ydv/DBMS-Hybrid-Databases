/**
 * Test API Endpoints
 * Simple script to test all available endpoints
 */

const baseURL = 'http://localhost:5000';

async function testAPI(method, endpoint, body = null) {
  const url = `${baseURL}${endpoint}`;
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  if (body) {
    options.body = JSON.stringify(body);
  }
  
  try {
    const response = await fetch(url, options);
    const data = await response.json();
    
    console.log(`\n${method} ${endpoint}`);
    console.log(`Status: ${response.status}`);
    console.log('Response:', JSON.stringify(data, null, 2));
    
    return data;
  } catch (error) {
    console.error(`\n❌ Error testing ${method} ${endpoint}:`, error.message);
    return null;
  }
}

async function runTests() {
  console.log('🧪 Testing Food Delivery API Endpoints\n');
  console.log('=' .repeat(60));
  
  // Test 1: Health Check
  console.log('\n📊 Test 1: Health Check');
  await testAPI('GET', '/health');
  
  // Test 2: Get All Restaurants
  console.log('\n📊 Test 2: Get All Restaurants');
  await testAPI('GET', '/api/restaurants');
  
  // Test 3: Get Single Restaurant
  console.log('\n📊 Test 3: Get Restaurant by ID');
  await testAPI('GET', '/api/restaurants/1');
  
  // Test 4: Get All Orders
  console.log('\n📊 Test 4: Get All Orders');
  await testAPI('GET', '/api/orders');
  
  // Test 5: Get Single Order
  console.log('\n📊 Test 5: Get Order by ID');
  await testAPI('GET', '/api/orders/1');
  
  // Test 6: Get Orders by Restaurant
  console.log('\n📊 Test 6: Get Orders for Restaurant 1');
  await testAPI('GET', '/api/orders/restaurant/1');
  
  // Test 7: Get Available Deliveries
  console.log('\n📊 Test 7: Get Available Deliveries');
  await testAPI('GET', '/api/orders/delivery/available');
  
  // Test 8: Create New Order (Transaction Test)
  console.log('\n📊 Test 8: Create New Order (Transaction)');
  const newOrder = {
    user_id: 1,
    restaurant_id: 1,
    items: [
      {
        menu_item_id: 'test_menu_1',
        item_name: 'Margherita Pizza',
        unit_price: 299.00,
        quantity: 2
      },
      {
        menu_item_id: 'test_menu_2',
        item_name: 'Garlic Bread',
        unit_price: 99.00,
        quantity: 1
      }
    ],
    delivery_address: '404, Test Towers, Test Area, Mumbai 400001',
    payment_method: 'UPI',
    total_amount: 697.00
  };
  const createResult = await testAPI('POST', '/api/orders', newOrder);
  
  // Test 9: Update Order Status
  if (createResult && createResult.success) {
    const newOrderId = createResult.data.order_id;
    console.log('\n📊 Test 9: Update Order Status');
    await testAPI('PUT', `/api/orders/${newOrderId}/status`, {
      status: 'ACCEPTED'
    });
    
    // Test 10: Assign Partner (Stored Procedure)
    console.log('\n📊 Test 10: Assign Partner (Stored Procedure)');
    await testAPI('POST', `/api/orders/${newOrderId}/assign-partner`);
  }
  
  // Test 11: Get User Order Stats
  console.log('\n📊 Test 11: Get User Order Statistics');
  await testAPI('GET', '/api/orders/user/1/stats');
  
  // Test 12: Get Restaurant Stats
  console.log('\n📊 Test 12: Get Restaurant Statistics');
  await testAPI('GET', '/api/restaurants/1/stats');
  
  console.log('\n' + '='.repeat(60));
  console.log('✅ All API tests completed!');
  console.log('\n💡 Check the responses above to verify data');
  console.log('🔍 You can also test these endpoints in your browser or Postman\n');
}

// Run tests
runTests().catch(console.error);
