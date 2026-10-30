# API Testing Guide

## 🚀 Server Running

Server is running on: **http://localhost:5000**

---

## 📡 Available Endpoints

### Health Check
```
GET http://localhost:5000/health
```

### Restaurants

#### Get All Restaurants
```http
GET http://localhost:5000/api/restaurants

# With filters:
GET http://localhost:5000/api/restaurants?city=Mumbai
GET http://localhost:5000/api/restaurants?cuisine_type=Italian
```

#### Get Restaurant by ID
```http
GET http://localhost:5000/api/restaurants/1
```

#### Get Restaurant Statistics
```http
GET http://localhost:5000/api/restaurants/1/stats
```

### Orders

#### Get All Orders
```http
GET http://localhost:5000/api/orders

# With filters:
GET http://localhost:5000/api/orders?status=DELIVERED
GET http://localhost:5000/api/orders?user_id=1
GET http://localhost:5000/api/orders?restaurant_id=1
```

#### Get Order by ID
```http
GET http://localhost:5000/api/orders/1
```

#### Create New Order (Transaction)
```http
POST http://localhost:5000/api/orders
Content-Type: application/json

{
  "user_id": 1,
  "restaurant_id": 1,
  "items": [
    {
      "menu_item_id": "test_menu_1",
      "item_name": "Margherita Pizza",
      "unit_price": 299.00,
      "quantity": 2
    }
  ],
  "delivery_address": "123 Test Address",
  "payment_method": "UPI",
  "total_amount": 598.00
}
```

#### Update Order Status
```http
PUT http://localhost:5000/api/orders/4/status
Content-Type: application/json

{
  "status": "PREPARING"
}
```

#### Assign Delivery Partner (Stored Procedure)
```http
POST http://localhost:5000/api/orders/4/assign-partner
```

#### Get Restaurant Orders
```http
GET http://localhost:5000/api/orders/restaurant/1
GET http://localhost:5000/api/orders/restaurant/1?status=PLACED
```

#### Get Available Deliveries
```http
GET http://localhost:5000/api/orders/delivery/available
```

#### Get Partner Deliveries
```http
GET http://localhost:5000/api/orders/delivery/partner/1
```

#### Get User Order Statistics
```http
GET http://localhost:5000/api/orders/user/1/stats
```

---

## 🧪 Testing Methods

### Option 1: Browser
Simply open these URLs in your browser:
- http://localhost:5000/health
- http://localhost:5000/api/restaurants
- http://localhost:5000/api/orders

### Option 2: Using test-apis.js Script
```bash
cd backend
node test-apis.js
```

### Option 3: PowerShell
```powershell
# GET request
Invoke-WebRequest -Uri "http://localhost:5000/api/restaurants" | Select-Object -ExpandProperty Content

# POST request
$body = @{
    user_id = 1
    restaurant_id = 1
    items = @(
        @{
            menu_item_id = "test_1"
            item_name = "Pizza"
            unit_price = 299
            quantity = 1
        }
    )
    delivery_address = "Test Address"
    payment_method = "UPI"
    total_amount = 299
} | ConvertTo-Json

Invoke-WebRequest -Uri "http://localhost:5000/api/orders" -Method POST -Body $body -ContentType "application/json"
```

---

## ✅ Working Features

### Database Operations
- ✅ **Get all restaurants** with filters
- ✅ **Get restaurant details** with owner info and statistics
- ✅ **Get all orders** with customer, restaurant, and partner details
- ✅ **Get order details** with items and payment info
- ✅ **Create order** with MySQL transaction (ACID)
- ✅ **Update order status**
- ✅ **Assign delivery partner** using stored procedure
- ✅ **Get statistics** for users and restaurants

### DBMS Concepts Demonstrated
- ✅ **Complex JOINs**: Orders with users, restaurants, and partners
- ✅ **Transactions**: Order creation with BEGIN/COMMIT/ROLLBACK
- ✅ **Stored Procedures**: assign_partner function
- ✅ **Aggregations**: Statistics and revenue calculations
- ✅ **Foreign Keys**: Maintaining referential integrity
- ✅ **Filters**: Query parameters for flexible data retrieval

---

## 📊 Sample Data

### Users
- ID 1: Rahul Kumar (customer)
- ID 2: Priya Sharma (customer)
- ID 3: Amit Patel (customer)
- ID 4: Neha Singh (restaurant owner)
- ID 5: Vikram Reddy (restaurant owner)
- ID 7: Arjun Mehta (delivery partner)
- ID 8: Deepak Yadav (delivery partner)

### Restaurants
- ID 1: Pizza Palace (Italian)
- ID 2: Spice Garden (Indian)
- ID 3: Dragon Wok (Chinese)
- ID 4: Burger Hub (American)
- ID 5: Taco Fiesta (Mexican)

### Orders (Various States)
- Order 1: CANCELLED (trigger tested - payment refunded)
- Order 2: PICKED_UP (in transit)
- Order 3: PREPARING (being cooked)
- Order 4: ACCEPTED (ready for partner assignment)
- Order 5: PLACED (just ordered)
- Orders 6-7: DELIVERED (completed)

---

## 🎓 For Faculty Demonstration

### 1. Show Working APIs
```bash
# Open browser tabs:
http://localhost:5000/api/restaurants
http://localhost:5000/api/orders
http://localhost:5000/api/orders/1
```

### 2. Demonstrate Transaction
Run test-apis.js to show:
- Order creation with multiple items
- Atomic insertion into 3 tables
- Rollback on error (can simulate by breaking data)

### 3. Show Stored Procedure
```
POST http://localhost:5000/api/orders/4/assign-partner
```
Then check:
```
GET http://localhost:5000/api/orders/4
```
See partner_id assigned and status changed to PREPARING!

### 4. Show JOINs
```
GET http://localhost:5000/api/orders
```
Notice how data from users, restaurants, and delivery_partners tables are combined!

### 5. Show Aggregations
```
GET http://localhost:5000/api/restaurants/1/stats
GET http://localhost:5000/api/orders/user/1/stats
```
Revenue, order counts, averages calculated from database!

---

## 🔧 Troubleshooting

### Server Not Running
```bash
cd backend
npm start
```

### Connection Errors
- Check MySQL RDS is running
- Verify .env file has correct credentials
- Ensure security group allows your IP

### API Returns Empty Data
- Run seed script again:
```bash
node scripts/seed-mysql.js
```

---

## 📝 Next Steps

1. ✅ MySQL APIs - COMPLETE
2. ⏳ MongoDB connection fix
3. ⏳ Menu APIs (needs MongoDB)
4. ⏳ Review APIs (needs MongoDB)
5. ⏳ Analytics APIs (MongoDB aggregations)
6. ⏳ Frontend development

---

**Status**: Phase 2 - 60% Complete (MySQL features working)
