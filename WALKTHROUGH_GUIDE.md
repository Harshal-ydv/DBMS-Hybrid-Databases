# Food Delivery System - Complete Walkthrough

## 🎯 Quick Overview

### Your Database Setup
```
┌─────────────────────────────────────────────────────┐
│              YOUR APPLICATION                        │
│  (Running on localhost:3000 & localhost:5000)       │
└──────────────────┬──────────────────────────────────┘
                   │
        ┌──────────┴──────────┐
        │                     │
        ▼                     ▼
┌───────────────┐     ┌──────────────┐
│   AWS RDS     │     │   MongoDB    │
│   (MySQL)     │     │   (Local)    │
├───────────────┤     ├──────────────┤
│ • users       │     │ • reviews    │
│ • restaurants │     │ • events     │
│ • orders      │     │ • menus      │
│ • order_items │     │              │
│ • payments    │     │              │
│ • partners    │     │              │
└───────────────┘     └──────────────┘
  TRANSACTIONS         FLEXIBLE DATA
  ACID Compliant       JSON Documents
```

### Why Two Databases?
- **MySQL (AWS RDS):** Stores structured data (orders, payments, users) that needs ACID transactions
- **MongoDB (Local):** Stores flexible data (menus, reviews) that can have varying fields

---

## 📱 Complete Walkthrough with Database Changes

### **STEP 1: Customer Places Order**

**UI Actions:**
1. Go to `http://localhost:3000`
2. Select **"Customer"** → Choose **"Rahul Kumar"**
3. Click **"Browse Restaurants"** tab
4. Click **"View Menu"** on any restaurant
5. Click **"Add to Cart"** on menu items
6. Click **"Cart"** button → **"Proceed to Checkout"**
7. Select **Delivery Address** → **Payment Method** → **Confirm Order**

**What Happens Behind the Scenes:**
```javascript
// Frontend sends:
POST http://localhost:5000/api/orders
{
  user_id: 1,
  restaurant_id: 1,
  items: [{ item_name: "Margherita Pizza", price: 299, quantity: 1 }],
  delivery_address: "123 Main St",
  payment_method: "CARD",
  total_amount: 299
}
```

**Database Changes (MySQL on AWS):**

```sql
-- 1️⃣ INSERT into orders table
INSERT INTO orders 
(user_id, restaurant_id, total_amount, status, delivery_address)
VALUES (1, 1, 299, 'PLACED', '123 Main St');
-- Returns order_id = 28

-- 2️⃣ INSERT into order_items table
INSERT INTO order_items 
(order_id, item_name, unit_price, quantity)
VALUES (28, 'Margherita Pizza', 299, 1);

-- 3️⃣ INSERT into payments table
INSERT INTO payments 
(order_id, amount, method, status)
VALUES (28, 299, 'CARD', 'SUCCESS');
```

**Database Changes (MongoDB Local):**
```javascript
// Event logged
db.events.insertOne({
  order_id: 28,
  status: "PLACED",
  by_role: "customer",
  by_id: 1,
  timestamp: new Date(),
  note: "Order created for ₹299 via CARD"
})
```

**How to View:**
```bash
# Check MySQL (AWS RDS)
SELECT * FROM orders WHERE order_id = 28;
SELECT * FROM order_items WHERE order_id = 28;
SELECT * FROM payments WHERE order_id = 28;

# Check MongoDB (Local)
db.events.find({ order_id: 28 })
```

---

### **STEP 2: Restaurant Owner Views & Accepts Order**

**UI Actions:**
1. Click **"Logout"** → Select **"Restaurant Owner"** → Choose **"Neha Singh"**
2. Select **"Pizza Palace"** restaurant
3. See new order #28 with status **"PLACED"**
4. Click **"Accept Order"** button

**Backend Request:**
```javascript
PUT http://localhost:5000/api/orders/28/status
{
  status: "ACCEPTED",
  updated_by: "owner"
}
```

**Database Changes (MySQL):**
```sql
-- UPDATE orders table
UPDATE orders 
SET status = 'ACCEPTED' 
WHERE order_id = 28;

-- Before: status = 'PLACED'
-- After:  status = 'ACCEPTED' ✓
```

**Database Changes (MongoDB):**
```javascript
db.events.insertOne({
  order_id: 28,
  status: "ACCEPTED",
  by_role: "owner",
  timestamp: new Date(),
  note: "Status changed from PLACED to ACCEPTED"
})
```

---

### **STEP 3: Restaurant Starts Preparing**

**UI Actions:**
1. Order #28 now shows **"Start Preparing"** button
2. Click **"Start Preparing"**

**Database Changes (MySQL):**
```sql
UPDATE orders 
SET status = 'PREPARING' 
WHERE order_id = 28;

-- After: status = 'PREPARING' ✓
```

**What Changes:**
- Order #28 now appears in **Delivery Partner's "Available Orders"** tab
- This is because the query looks for:
```sql
SELECT * FROM orders 
WHERE status IN ('PREPARING', 'READY_FOR_PICKUP') 
AND partner_id IS NULL
```

---

### **STEP 4: Restaurant Marks as Ready**

**UI Actions:**
1. Click **"Mark as Ready"** button

**Database Changes (MySQL):**
```sql
UPDATE orders 
SET status = 'READY_FOR_PICKUP' 
WHERE order_id = 28;

-- After: status = 'READY_FOR_PICKUP' ✓
```

**What Changes:**
- Order still visible to delivery partners
- Color changes from orange (PREPARING) to green (READY_FOR_PICKUP) in partner dashboard

---

### **STEP 5: Delivery Partner Accepts Order**

**UI Actions:**
1. Logout → Select **"Delivery Partner"** → Choose **"Arjun Mehta"**
2. See order #28 in **"Available Orders"** tab
3. Click **"Accept Delivery"**

**Backend Request:**
```javascript
POST http://localhost:5000/api/orders/28/accept-delivery
{
  partner_id: 1
}
```

**Database Changes (MySQL) - WITH TRANSACTION:**
```sql
BEGIN TRANSACTION;

-- 1️⃣ Lock the row to prevent race condition
SELECT order_id, status, partner_id 
FROM orders 
WHERE order_id = 28 
FOR UPDATE;

-- 2️⃣ Check if partner_id is NULL
-- If another partner already accepted, ROLLBACK and return 409 error

-- 3️⃣ Assign partner
UPDATE orders 
SET partner_id = 1 
WHERE order_id = 28;

COMMIT;

-- After: partner_id = 1 ✓
-- Status remains 'READY_FOR_PICKUP'
```

**What Changes:**
- Order disappears from "Available Orders" (because partner_id is no longer NULL)
- Order appears in partner's **"My Deliveries"** tab
- Query: `WHERE partner_id = 1 AND status IN ('PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP')`

---

### **STEP 6: Partner Picks Up Order**

**UI Actions:**
1. In **"My Deliveries"** tab, click **"Mark as Picked Up"**

**Database Changes (MySQL):**
```sql
UPDATE orders 
SET status = 'PICKED_UP' 
WHERE order_id = 28;

-- After: status = 'PICKED_UP' ✓
-- partner_id = 1 (unchanged)
```

---

### **STEP 7: Partner Delivers Order**

**UI Actions:**
1. Click **"Mark as Delivered"**

**Database Changes (MySQL):**
```sql
UPDATE orders 
SET status = 'DELIVERED' 
WHERE order_id = 28;

-- After: status = 'DELIVERED' ✓
```

**What Changes:**
- Order moves from **"My Deliveries"** to **"Completed Today"** tab
- Query filters by: `status = 'DELIVERED' AND placed_at = TODAY`
- Customer can now write a review

---

### **STEP 8: Customer Writes Review**

**UI Actions:**
1. Logout → Select **"Customer"** → **"Rahul Kumar"**
2. Go to **"My Orders"** tab
3. Find order #28 (status: DELIVERED)
4. Click **"Write Review"**
5. Rate food (5 stars), delivery (5 stars), add comment
6. Click **"Submit Review"**

**Backend Request:**
```javascript
POST http://localhost:5000/api/reviews
{
  order_id: 28,
  user_id: 1,
  restaurant_id: 1,
  restaurant_rating: 5,
  delivery_rating: 5,
  comment: "Excellent food and fast delivery!"
}
```

**Database Changes (MongoDB):**
```javascript
db.reviews.insertOne({
  _id: ObjectId("..."),
  order_id: 28,
  user_id: 1,
  restaurant_id: 1,
  restaurant_rating: 5,
  delivery_rating: 5,
  comment: "Excellent food and fast delivery!",
  created_at: new Date()
})
```

**What Changes:**
- Review appears in **Admin Dashboard** → "Customer Feedback" section
- Restaurant's average rating updates
- Customer cannot review the same order again (frontend tracks in Set)

---

## 🔍 How to View Your Databases

### **Option 1: View MySQL (AWS RDS) via Backend Script**

The file already exists: `backend/view-database.js`

Run:
```bash
cd backend
node view-database.js
```

You'll see:
```
=== ORDERS ===
┌─────────┬──────────┬─────────────┬────────────┬────────────┬──────────────────┐
│order_id │ user_id  │restaurant_id│ partner_id │  status    │   total_amount   │
├─────────┼──────────┼─────────────┼────────────┼────────────┼──────────────────┤
│   28    │    1     │      1      │     1      │ DELIVERED  │      299.00      │
└─────────┴──────────┴─────────────┴────────────┴────────────┴──────────────────┘
```

### **Option 2: View MongoDB (Local) via Script**

Create: `backend/view-mongodb.js`
```javascript
const { getMongoDBConnection } = require('./config/database');

async function viewMongoDB() {
  const db = await getMongoDBConnection();
  
  console.log('\n=== REVIEWS ===');
  const reviews = await db.collection('reviews').find().limit(5).toArray();
  console.table(reviews);
  
  console.log('\n=== EVENTS (Last 5) ===');
  const events = await db.collection('events')
    .find()
    .sort({ timestamp: -1 })
    .limit(5)
    .toArray();
  console.table(events);
  
  process.exit(0);
}

viewMongoDB();
```

Run:
```bash
node backend/view-mongodb.js
```

### **Option 3: Using APIs (Easiest)**

Open these URLs in your browser:

**MySQL Data via API:**
```
http://localhost:5000/api/orders                    # All orders
http://localhost:5000/api/orders/28                 # Specific order
http://localhost:5000/api/orders/28/items           # Order items
http://localhost:5000/api/restaurants               # All restaurants
http://localhost:5000/api/orders/restaurant/1       # Restaurant's orders
http://localhost:5000/api/orders/delivery/partner/1 # Partner's orders
```

**MongoDB Data via API:**
```
http://localhost:5000/api/reviews/restaurant/1      # Restaurant reviews
http://localhost:5000/api/reviews/user/1            # User's reviews
http://localhost:5000/api/events/order/28           # Order events
http://localhost:5000/api/menus/restaurant/1        # Restaurant menu
```

### **Option 4: MySQL Workbench (GUI Tool)**

1. Download [MySQL Workbench](https://dev.mysql.com/downloads/workbench/)
2. Create New Connection:
   - **Connection Name:** Food Delivery AWS
   - **Hostname:** food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com
   - **Port:** 3306
   - **Username:** (check your `.env` file)
   - **Password:** (check your `.env` file)
3. Click **Test Connection** → **OK**
4. Double-click connection to open
5. Run queries:
```sql
USE fooddelivery;
SELECT * FROM orders ORDER BY order_id DESC LIMIT 10;
SELECT * FROM payments ORDER BY payment_id DESC LIMIT 10;
```

### **Option 5: MongoDB Compass (GUI Tool)**

1. Download [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Connect to: `mongodb://localhost:27017`
3. Select database: **food_delivery**
4. Browse collections: **reviews**, **events**, **menus**
5. Click on any collection to see documents

---

## 🎓 Key Concepts Explained

### **1. ACID Transactions (MySQL)**
```javascript
BEGIN TRANSACTION;  // Start
// ... multiple operations ...
COMMIT;            // Success - save all changes
// OR
ROLLBACK;          // Failure - undo everything
```

**Example:** When creating order, all 3 inserts (order, items, payment) happen together or not at all.

**Why Important?**
- If payment insert fails, the order and items are also removed
- Prevents incomplete orders in database

### **2. Race Condition Prevention**
```sql
SELECT * FROM orders WHERE order_id = 28 FOR UPDATE;
```
- Locks the row so only one partner can accept at a time
- Other partners wait or get 409 Conflict error

**Real Scenario:**
- Partner A clicks "Accept" at 10:00:00.000
- Partner B clicks "Accept" at 10:00:00.001
- Partner A gets the order, Partner B sees "Order already taken"

### **3. Foreign Keys**
```sql
orders.user_id → users.user_id
orders.restaurant_id → restaurants.restaurant_id
```
- Ensures data integrity
- Can't delete a user if they have orders
- Can't assign order to non-existent restaurant

### **4. Enums**
```sql
status ENUM('PLACED', 'ACCEPTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED')
```
- Only these exact values allowed
- Database rejects typos like "PLACEED" or "DELIVERD"

---

## 📊 Data Flow Summary

```
Customer Action → Frontend React → API Call → Backend Node.js
                                                    ↓
                                          ┌─────────┴─────────┐
                                          │                   │
                                          ▼                   ▼
                                    MySQL (AWS RDS)    MongoDB (Local)
                                    Orders, Payments    Reviews, Events
                                          │                   │
                                          └─────────┬─────────┘
                                                    ↓
                              Updated data sent back to Frontend
                                                    ↓
                                          UI updates instantly
```

---

## 🎯 Quick Reference

| Action | MySQL Table | MongoDB Collection | Status Change |
|--------|-------------|-------------------|---------------|
| Place Order | orders, order_items, payments | events | → PLACED |
| Accept Order | orders | events | PLACED → ACCEPTED |
| Start Preparing | orders | events | ACCEPTED → PREPARING |
| Mark Ready | orders | events | PREPARING → READY_FOR_PICKUP |
| Accept Delivery | orders | events | (partner_id assigned) |
| Pick Up | orders | events | READY_FOR_PICKUP → PICKED_UP |
| Deliver | orders | events | PICKED_UP → DELIVERED |
| Write Review | - | reviews | - |

---

## 🔧 Connection Configuration

Check your `backend/.env` file:
```
# MySQL on AWS RDS
MYSQL_HOST=food-delivery-db.chcisgcswz7m.ap-south-1.rds.amazonaws.com
MYSQL_USER=admin
MYSQL_PASSWORD=your_password
MYSQL_DATABASE=fooddelivery

# MongoDB Local
MONGODB_URI=mongodb://localhost:27017/food_delivery
```

The backend connects to both databases when it starts in `backend/config/database.js`!

---

## 🚀 Try It Yourself!

**Complete Flow Test:**
1. Open browser to `http://localhost:3000`
2. Place an order as customer
3. Accept as restaurant owner
4. Mark as ready
5. Accept as delivery partner
6. Deliver
7. Write review as customer
8. View in admin dashboard

**Check Database After Each Step:**
```bash
# Quick check
curl http://localhost:5000/api/orders/LATEST_ORDER_ID

# Or use view-database.js
node backend/view-database.js
```

That's it! Your application is now fully explained! 🎉
