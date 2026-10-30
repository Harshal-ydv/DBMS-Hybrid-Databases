const axios = require('axios');

async function checkStatus() {
  console.log('\n🔍 Checking System Status...\n');
  console.log('='.repeat(50));

  // Check Backend
  try {
    const response = await axios.get('http://localhost:5000/health');
    console.log('✅ Backend Server: RUNNING');
    console.log('   MySQL:', response.data.databases.mysql);
    console.log('   MongoDB:', response.data.databases.mongodb);
  } catch (error) {
    console.log('❌ Backend Server: NOT RUNNING');
    console.log('   Start with: cd backend && node server.js');
  }

  console.log('');

  // Check Restaurants API
  try {
    const response = await axios.get('http://localhost:5000/api/restaurants');
    console.log('✅ Restaurants API: WORKING');
    console.log('   Found:', response.data.count, 'restaurants');
    console.log('   Sample:', response.data.data[0].name);
  } catch (error) {
    console.log('❌ Restaurants API: ERROR');
  }

  console.log('');

  // Check Orders API
  try {
    const response = await axios.get('http://localhost:5000/api/orders');
    console.log('✅ Orders API: WORKING');
    console.log('   Found:', response.data.count || response.data.data.length, 'orders');
  } catch (error) {
    console.log('❌ Orders API: ERROR');
  }

  console.log('');

  // Check Menus API
  try {
    const response = await axios.get('http://localhost:5000/api/menus');
    console.log('✅ Menus API: WORKING');
    console.log('   Found:', response.data.length, 'menus');
  } catch (error) {
    console.log('❌ Menus API: ERROR');
  }

  console.log('');

  // Check Frontend
  try {
    const response = await axios.get('http://localhost:3000');
    console.log('✅ Frontend App: RUNNING');
    console.log('   Open: http://localhost:3000');
  } catch (error) {
    console.log('❌ Frontend App: NOT RUNNING');
    console.log('   Start with: cd frontend && npm start');
  }

  console.log('');
  console.log('='.repeat(50));
  console.log('\n💡 If everything shows ✅, open: http://localhost:3000\n');
}

checkStatus();
