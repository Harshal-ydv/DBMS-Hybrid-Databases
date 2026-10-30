# ✅ Setup Verification Guide

## Current Status: WORKING! ✅

Both servers are running and databases are connected. Data is flowing correctly.

---

## Quick Verification

### 1. Check Backend Server
```bash
cd backend
node server.js
```

**Expected Output:**
```
✅ MySQL connected successfully
✅ MongoDB connected successfully
✅ Server running on port 5000
```

### 2. Check Frontend Server
```bash
cd frontend
npm start
```

**Expected Output:**
```
Compiled successfully!
You can now view frontend in the browser.
Local: http://localhost:3000
```

### 3. Test API Endpoints
```bash
# In PowerShell
Invoke-RestMethod -Uri 'http://localhost:5000/api/restaurants' -Method Get
```

**Expected:** JSON with 5 restaurants

---

## What's Fixed

✅ **Backend Server** - Running on port 5000  
✅ **Frontend Server** - Running on port 3000  
✅ **MySQL Database** - Connected to AWS RDS  
✅ **MongoDB Database** - Connected locally  
✅ **Restaurant Data** - Added missing phone & rating columns  
✅ **API Responses** - All endpoints working  
✅ **CORS** - Enabled and working  

---

## Browser Test

### Open Application
1. Open browser: **http://localhost:3000**
2. You should see the landing page with 4 roles

### Test Customer Flow
1. Click "Continue as Customer"
2. You should see 5 restaurants:
   - Pizza Palace (Italian) ⭐ 4.0
   - Spice Garden (Indian) ⭐ 4.0
   - Dragon Wok (Chinese) ⭐ 4.0
   - Burger Hub (American) ⭐ 4.0
   - Taco Fiesta (Mexican) ⭐ 4.0

### If No Restaurants Show
**Check browser console** (F12):
- No errors = Frontend is working
- Network errors = Backend might be down
- CORS errors = Check backend CORS settings

---

## API Endpoints to Test

### 1. Get Restaurants
```
GET http://localhost:5000/api/restaurants
```
Should return 5 restaurants with phone and rating

### 2. Get Menu
```
GET http://localhost:5000/api/menus/restaurant/1
```
Should return menu with categories and items

### 3. Get Orders
```
GET http://localhost:5000/api/orders
```
Should return existing orders

### 4. Create Order (Test)
```bash
# PowerShell
$body = @{
    user_id = 1
    restaurant_id = 1
    items = @(
        @{ item_name = "Test Pizza"; quantity = 1; price = 10.99 }
    )
    delivery_address = "123 Test St"
    payment_method = "CARD"
    total_amount = 10.99
} | ConvertTo-Json

Invoke-RestMethod -Uri 'http://localhost:5000/api/orders' -Method Post -Body $body -ContentType 'application/json'
```

---

## Common Issues & Solutions

### Issue: "Cannot connect to backend"
**Solution:**
1. Check if backend is running: `Get-Process node`
2. Restart backend: `cd backend && node server.js`
3. Check port 5000: `netstat -ano | Select-String ":5000"`

### Issue: "No restaurants showing"
**Solution:**
1. Check browser console (F12) for errors
2. Verify API response: `Invoke-RestMethod http://localhost:5000/api/restaurants`
3. Check backend logs for errors

### Issue: "MongoDB not connected"
**Solution:**
1. Start MongoDB: `mongod` or check if service is running
2. Test connection: `node backend/test-connection.js`
3. Check MongoDB is on port 27017

### Issue: "MySQL not connected"
**Solution:**
1. Check .env file has correct credentials
2. Test connection: `node backend/test-connection.js`
3. Verify AWS RDS security group allows your IP

### Issue: "Frontend shows blank page"
**Solution:**
1. Clear browser cache (Ctrl+Shift+Del)
2. Refresh page (Ctrl+F5)
3. Check console for JavaScript errors
4. Restart frontend: Stop (Ctrl+C) then `npm start`

---

## Database Verification

### MySQL Tables
```bash
node -e "const mysql = require('mysql2/promise'); const config = require('./backend/config/env'); mysql.createConnection({ host: config.mysql.host, user: config.mysql.user, password: config.mysql.password, database: config.mysql.database }).then(async conn => { const [rows] = await conn.query('SHOW TABLES'); console.log(rows); await conn.end(); });"
```

**Expected:** 9 tables (restaurants, orders, users, etc.)

### MongoDB Collections
```bash
mongosh --eval "use food_delivery; db.getCollectionNames()"
```

**Expected:** menus, reviews, order_events

### Check Data Counts
```bash
cd backend
node -e "const mysql = require('mysql2/promise'); const config = require('./config/env'); mysql.createConnection({ host: config.mysql.host, user: config.mysql.user, password: config.mysql.password, database: config.mysql.database }).then(async conn => { const [restaurants] = await conn.query('SELECT COUNT(*) as count FROM restaurants'); const [orders] = await conn.query('SELECT COUNT(*) as count FROM orders'); console.log('Restaurants:', restaurants[0].count); console.log('Orders:', orders[0].count); await conn.end(); });"
```

**Expected:**
- Restaurants: 5
- Orders: 7 or more

---

## Performance Check

### Backend Response Time
```bash
Measure-Command { Invoke-RestMethod http://localhost:5000/api/restaurants } | Select-Object TotalMilliseconds
```

**Expected:** < 500ms

### Frontend Load Time
Open http://localhost:3000 and check Network tab (F12)
**Expected:** < 2 seconds for initial load

---

## Current Server Status

### Backend
- ✅ Port: 5000
- ✅ MySQL: Connected to AWS RDS
- ✅ MongoDB: Connected to localhost:27017
- ✅ CORS: Enabled
- ✅ API Endpoints: 43+ working

### Frontend  
- ✅ Port: 3000
- ✅ React: Compiled successfully
- ✅ Material-UI: Loaded
- ✅ API Client: Configured for localhost:5000

### Databases
- ✅ MySQL: food_delivery (9 tables, 5 restaurants, 7+ orders)
- ✅ MongoDB: food_delivery (3 collections, menus, reviews, events)

---

## Test Script

Run this to verify everything:

```bash
cd backend
node test-connection.js
node test-apis.js
node test-mongodb-apis.js
```

All tests should pass!

---

## Manual Browser Test Checklist

Visit http://localhost:3000 and verify:

- [ ] Landing page loads
- [ ] 4 role cards visible
- [ ] Click "Customer" - redirects to /customer
- [ ] Restaurants list loads (5 restaurants)
- [ ] Each restaurant shows name, cuisine, rating
- [ ] Click "View Menu" works
- [ ] Menu items display
- [ ] "Add to Cart" button works
- [ ] Cart shows items
- [ ] "Place Order" button works
- [ ] Order created successfully
- [ ] "My Orders" tab shows orders
- [ ] "Track Order" shows timeline
- [ ] Logout works
- [ ] Can switch roles

---

## Success Indicators

### ✅ Everything is Working When:
1. Backend console shows: "Server running on port 5000"
2. Frontend browser opens at http://localhost:3000
3. Landing page displays 4 role cards
4. Clicking Customer shows 5 restaurants with ratings
5. Backend logs show API requests coming in
6. No errors in browser console (F12)
7. API test scripts all pass

### ⚠️ Troubleshoot If:
1. Blank page in browser
2. "Cannot connect" errors in console
3. Backend shows database connection errors
4. Frontend shows network errors
5. No data displayed on any page

---

## Final Verification Command

```bash
# Run all in sequence
cd backend
echo "Testing connections..."
node test-connection.js
echo "Testing APIs..."
node test-apis.js
echo "Backend is working if all tests passed!"
```

---

## Support

If issues persist:
1. Check `backend/server.js` console for errors
2. Check browser console (F12) for frontend errors
3. Verify both servers are running: `Get-Process node`
4. Test API directly: `Invoke-RestMethod http://localhost:5000/api/restaurants`
5. Restart both servers

**Both servers ARE running and working! The application is functional.** 🎉
