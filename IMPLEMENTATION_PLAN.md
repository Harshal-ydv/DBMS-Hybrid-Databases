# **Implementation Plan - Food Delivery System with Hybrid Database Architecture**

## **Problem Statement**

Build a full-stack food delivery application that demonstrates hybrid database architecture by using MySQL (AWS RDS) for transactional data (orders, payments, users) and MongoDB (Atlas) for flexible schema data (menus, event logs, reviews). The system must showcase core DBMS concepts including normalization, transactions, triggers, stored procedures, views, indexing, and aggregations across four user roles.

## **Requirements**

### **Functional Requirements**
1. **Customer Panel**: Browse restaurants, view customizable menus, place orders with mock payment, track order status timeline, rate restaurant and delivery
2. **Restaurant Owner Panel**: View incoming orders, accept/reject orders, manage menu items with customizations, see order history
3. **Delivery Partner Panel**: View available deliveries, accept delivery assignments, update delivery status (picked up, delivered)
4. **Admin Panel**: Analytics dashboard showing peak order hours, revenue per restaurant, top-rated restaurants
5. **Role Selection**: Simple role switcher (no complex authentication for demo purposes)

### **Technical Requirements**
1. **MySQL (AWS RDS)**: Users, restaurants, delivery partners, orders, order items, payments (6 tables, 3NF)
2. **MongoDB (Atlas)**: Menus with nested customizations, order status event logs, reviews (3 collections)
3. **DBMS Concepts to Demonstrate**:
   - Transaction: Place order (insert order + items + payment atomically)
   - Trigger: Auto-cancel order when payment is refunded
   - View: Restaurant revenue calculation
   - Stored Procedure: Assign available delivery partner to order
   - Joins & Subqueries: Order history with restaurant details
   - MongoDB Aggregation: Peak hours analysis, average ratings
   - Indexes: Performance optimization with explain() comparison

### **Non-Functional Requirements**
1. Professional UI resembling real food delivery apps (Swiggy/Zomato/UberEats style)
2. Clear separation of concerns (database layer, business logic, API, UI)
3. Well-documented code suitable for academic presentation
4. Seed data for realistic demo

## **Background Research & Technology Decisions**

### **Why This Tech Stack?**

**Node.js + Express Backend**:
- Native async/await for handling multiple database connections
- Excellent drivers: `mysql2` (supports prepared statements, transactions) and `mongodb` (official driver)
- Lightweight and fast for API development
- Easy to demonstrate database operations in code reviews

**React + Material-UI Frontend**:
- Component reusability for 4 different user panels
- Material-UI provides professional components out-of-box (Cards, Tables, Dialogs, AppBar)
- Familiar food-delivery-app aesthetics
- Easy to explain component-based architecture

**Database Design Rationale**:
- **MySQL for orders/payments**: ACID compliance critical for financial transactions, strong relational integrity
- **MongoDB for menus**: Flexible nested schema for customization options (avoid EAV anti-pattern in SQL)
- **MongoDB for event logs**: Append-only time-series data, fast writes, easy temporal queries
- **Link pattern**: Store MySQL IDs in MongoDB documents, store MongoDB ObjectIds as strings in MySQL

### **Cloud Setup Prerequisites**

**AWS RDS MySQL**:
- Free tier: db.t3.micro or db.t2.micro (check eligibility)
- Public accessibility: Yes (for development)
- Security group: Allow inbound on port 3306 from your IP
- Database name: `food_delivery`
- Keep endpoint, username, password for connection

**MongoDB Atlas**:
- Free M0 cluster (512MB)
- Cloud provider: AWS (same region as RDS for lower latency)
- Database name: `food_delivery`
- Network Access: Add your IP address (or 0.0.0.0/0 for testing only)
- Database user: Create with read/write privileges
- Connection string: Get from Atlas dashboard

## **Proposed Solution**

### **Architecture Overview**

```
┌─────────────────────────────────────────────────────────────┐
│                     React Frontend (Port 3000)               │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │Customer  │ │Restaurant│ │ Delivery │ │  Admin   │      │
│  │  Panel   │ │  Panel   │ │  Panel   │ │  Panel   │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            ↕ HTTP/REST API
┌─────────────────────────────────────────────────────────────┐
│              Node.js + Express Backend (Port 5000)           │
│  ┌─────────────────────────────────────────────────────────┐   │
│  │              Business Logic Layer                    │   │
│  │  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────┐│   │
│  │  │Order Svc │ │Menu Svc  │ │Events Svc│ │Analytics││   │
│  │  └──────────┘ └──────────┘ └──────────┘ └────────┘│   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │              Database Access Layer                   │   │
│  │  ┌──────────────────┐    ┌──────────────────┐     │   │
│  │  │ MySQL Connection │    │ MongoDB Connection│     │   │
│  │  └──────────────────┘    └──────────────────┘     │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
              ↕                              ↕
    ┌──────────────────┐          ┌──────────────────┐
    │  AWS RDS MySQL   │          │  MongoDB Atlas   │
    │                  │          │                  │
    │ • users          │          │ • menus          │
    │ • restaurants    │          │ • order_events   │
    │ • delivery_partners│        │ • reviews        │
    │ • orders         │          │                  │
    │ • order_items    │          │                  │
    │ • payments       │          │                  │
    └──────────────────┘          └──────────────────┘
```

### **Data Flow Example: Place Order**

```
Customer UI → POST /api/orders → Express API
                                      ↓
                                MySQL: BEGIN TRANSACTION
                                      ↓
                                INSERT INTO orders
                                      ↓
                                INSERT INTO order_items
                                      ↓
                                INSERT INTO payments
                                      ↓
                                COMMIT TRANSACTION
                                      ↓
                                MongoDB: INSERT order_event
                                      ↓
                                Return success to customer
```

### **Hybrid Database Sync Strategy**

**Rule**: MySQL is the source of truth for order state. MongoDB records the event history.

**On every status change**:
1. Update MySQL first (e.g., `UPDATE orders SET status='PREPARING'`)
2. Write event to MongoDB (`order_events.insertOne({order_id, status, timestamp})`)
3. If MongoDB write fails: Log error, return success (event can be backfilled)
4. If MySQL write fails: Roll back, return error to user

**Explain to faculty**: "MySQL guarantees consistency for money and order state. MongoDB provides audit trail and analytics. If they temporarily disagree, MySQL wins."

## **Task Breakdown**

### **Phase 1: Environment Setup & Database Design (Day 1)**

#### **Task 1: Project initialization and cloud database setup**
- **Objective**: Set up development environment and provision cloud databases
- **Implementation**:
  - Create project structure: `food-delivery-system/` with `backend/` and `frontend/` folders
  - Initialize Node.js project in backend: `npm init -y`
  - Install dependencies: `express`, `mysql2`, `mongodb`, `dotenv`, `cors`, `body-parser`
  - Create React app in frontend: `npx create-react-app frontend`
  - Install Material-UI: `npm install @mui/material @emotion/react @emotion/styled @mui/icons-material`
  - **AWS RDS Setup**:
    1. Log into AWS Console → RDS
    2. Create database → MySQL engine
    3. Choose free tier template (db.t3.micro)
    4. Set master username and password
    5. Enable public access
    6. Create security group rule: Inbound TCP 3306 from your IP
    7. Note down endpoint URL
  - **MongoDB Atlas Setup**:
    1. Log into MongoDB Atlas
    2. Create M0 free cluster (AWS, same region as RDS)
    3. Database Access: Create user with password
    4. Network Access: Add current IP or 0.0.0.0/0
    5. Get connection string from "Connect" button
  - Create `.env` file with connection strings (add to `.gitignore`)
  - Test connections: Write simple scripts to connect to both databases
- **Tests**: Run test scripts, confirm successful connection to both databases
- **Demo**: Show successful connection logs for MySQL and MongoDB, display cloud database dashboards

#### **Task 2: MySQL schema implementation with advanced features**
- **Objective**: Design and create normalized MySQL schema with triggers, views, and stored procedures
- **Implementation**:
  - Create SQL script `schema.sql` with 6 tables:
    ```sql
    CREATE TABLE users (
      user_id INT PRIMARY KEY AUTO_INCREMENT,
      name VARCHAR(100) NOT NULL,
      email VARCHAR(100) UNIQUE NOT NULL,
      phone VARCHAR(15),
      password_hash VARCHAR(255),
      role ENUM('customer','owner','partner','admin') NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
    
    CREATE TABLE restaurants (
      restaurant_id INT PRIMARY KEY AUTO_INCREMENT,
      owner_id INT,
      name VARCHAR(100) NOT NULL,
      city VARCHAR(50),
      address TEXT,
      is_open BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (owner_id) REFERENCES users(user_id)
    );
    
    CREATE TABLE delivery_partners (
      partner_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT UNIQUE,
      vehicle_type VARCHAR(50),
      is_available BOOLEAN DEFAULT TRUE,
      FOREIGN KEY (user_id) REFERENCES users(user_id)
    );
    
    CREATE TABLE orders (
      order_id INT PRIMARY KEY AUTO_INCREMENT,
      user_id INT,
      restaurant_id INT,
      partner_id INT NULL,
      total_amount DECIMAL(10,2),
      status ENUM('PLACED','ACCEPTED','REJECTED','PREPARING','PICKED_UP','DELIVERED','CANCELLED') DEFAULT 'PLACED',
      delivery_address TEXT,
      placed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(user_id),
      FOREIGN KEY (restaurant_id) REFERENCES restaurants(restaurant_id),
      FOREIGN KEY (partner_id) REFERENCES delivery_partners(partner_id)
    );
    
    CREATE TABLE order_items (
      item_id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT,
      menu_item_id VARCHAR(24),
      item_name VARCHAR(100),
      unit_price DECIMAL(8,2),
      quantity INT,
      FOREIGN KEY (order_id) REFERENCES orders(order_id) ON DELETE CASCADE
    );
    
    CREATE TABLE payments (
      payment_id INT PRIMARY KEY AUTO_INCREMENT,
      order_id INT UNIQUE,
      amount DECIMAL(10,2),
      method ENUM('UPI','CARD','COD'),
      status ENUM('SUCCESS','FAILED','REFUNDED') DEFAULT 'SUCCESS',
      paid_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (order_id) REFERENCES orders(order_id)
    );
    ```
  - **Create Trigger**: Auto-cancel order when payment is refunded
    ```sql
    DELIMITER $$
    CREATE TRIGGER cancel_order_on_refund
    AFTER UPDATE ON payments
    FOR EACH ROW
    BEGIN
      IF NEW.status = 'REFUNDED' AND OLD.status != 'REFUNDED' THEN
        UPDATE orders SET status = 'CANCELLED' WHERE order_id = NEW.order_id;
      END IF;
    END$$
    DELIMITER ;
    ```
  - **Create View**: Restaurant revenue from delivered orders
    ```sql
    CREATE VIEW restaurant_revenue AS
    SELECT 
      r.restaurant_id,
      r.name AS restaurant_name,
      COUNT(o.order_id) AS total_orders,
      SUM(o.total_amount) AS total_revenue
    FROM restaurants r
    LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
    WHERE o.status = 'DELIVERED'
    GROUP BY r.restaurant_id, r.name;
    ```
  - **Create Stored Procedure**: Assign available partner to order
    ```sql
    DELIMITER $$
    CREATE PROCEDURE assign_partner(IN p_order_id INT)
    BEGIN
      DECLARE v_partner_id INT;
      SELECT partner_id INTO v_partner_id
      FROM delivery_partners
      WHERE is_available = TRUE
      LIMIT 1;
      
      IF v_partner_id IS NOT NULL THEN
        UPDATE orders SET partner_id = v_partner_id WHERE order_id = p_order_id;
        UPDATE delivery_partners SET is_available = FALSE WHERE partner_id = v_partner_id;
      END IF;
    END$$
    DELIMITER ;
    ```
  - Execute schema script on AWS RDS MySQL
  - Document normalization: Explain why this is 3NF (no transitive dependencies)
- **Tests**: Verify all tables created, test trigger by updating payment status, query view, call stored procedure
- **Demo**: Show MySQL Workbench with schema diagram, demonstrate trigger in action, query the revenue view

#### **Task 3: MongoDB schema design and indexes**
- **Objective**: Create MongoDB collections with embedded documents and performance indexes
- **Implementation**:
  - Create database initialization script `mongodb-setup.js`
  - **Collection 1: menus** (one document per restaurant with nested structure)
    ```javascript
    {
      "restaurant_id": 1,
      "categories": [
        {
          "name": "Pizza",
          "items": [
            {
              "_id": ObjectId("..."),
              "name": "Margherita",
              "price": 249,
              "veg": true,
              "image": "url",
              "customizations": [
                {
                  "name": "Size",
                  "options": ["Small", "Medium", "Large"],
                  "required": true
                },
                {
                  "name": "Extra Toppings",
                  "options": ["Cheese", "Olives", "Mushrooms"],
                  "required": false
                }
              ]
            }
          ]
        }
      ]
    }
    ```
  - **Collection 2: order_events** (append-only event log)
    ```javascript
    {
      "order_id": 1,
      "status": "PICKED_UP",
      "by_role": "partner",
      "by_id": 5,
      "timestamp": ISODate("2024-01-20T14:30:00Z"),
      "note": "Left restaurant"
    }
    ```
  - **Collection 3: reviews**
    ```javascript
    {
      "order_id": 1,
      "user_id": 3,
      "restaurant_id": 1,
      "restaurant_rating": 4,
      "delivery_rating": 5,
      "comment": "Hot and fast delivery!",
      "created_at": ISODate("2024-01-20T15:00:00Z")
    }
    ```
  - **Create Indexes**:
    ```javascript
    db.order_events.createIndex({ "order_id": 1 });
    db.order_events.createIndex({ "timestamp": -1 });
    db.reviews.createIndex({ "restaurant_id": 1 });
    db.menus.createIndex({ "restaurant_id": 1 });
    ```
  - Test index performance with `explain("executionStats")` for queries with and without indexes
  - Document the design decision: Why embed customizations vs separate collection
- **Tests**: Insert sample documents, verify indexes with explain(), test queries
- **Demo**: Show MongoDB Compass with collections, demonstrate index performance comparison using explain()

#### **Task 4: Seed data generation for realistic demo**
- **Objective**: Populate both databases with comprehensive test data
- **Implementation**:
  - Create `seed.js` script that populates both databases
  - **MySQL seed data**:
    - 10+ users (2 customers, 2 restaurant owners, 2 delivery partners, 1 admin)
    - 5 restaurants (different cuisines: Italian, Chinese, Indian, Mexican, Burgers)
    - Link delivery partners
    - 10-15 sample orders in various states
    - Corresponding order items (referencing MongoDB menu item IDs)
    - Payment records for each order
  - **MongoDB seed data**:
    - Complete menus for all 5 restaurants (3-5 categories each, 4-6 items per category)
    - Realistic customization options (Size, Spice Level, Add-ons, etc.)
    - 20+ order events showing order lifecycle
    - 8-10 reviews with ratings and comments
  - Use realistic names, addresses, and food items
  - Ensure data consistency: order_items reference valid menu_item_id from MongoDB
- **Tests**: Query sample data from both databases, verify foreign key relationships, check MongoDB references
- **Demo**: Show populated tables in MySQL Workbench and collections in MongoDB Compass

---

### **Phase 2: Backend API Development (Day 2-3)**

#### **Task 5: Database connection layer and configuration**
- **Objective**: Create reusable database connection modules with error handling
- **Implementation**:
  - Create `backend/config/database.js`:
    - MySQL connection pool using `mysql2/promise`
    - MongoDB client connection with retry logic
    - Export connection instances
  - Create `backend/config/env.js`: Load and validate environment variables
  - Implement connection health check endpoints
  - Add graceful shutdown handlers
  - Structure: 
    ```
    backend/
    ├── config/
    │   ├── database.js
    │   └── env.js
    ├── models/
    ├── routes/
    ├── controllers/
    └── server.js
    ```
- **Tests**: Start server, test health check endpoints, verify both database connections
- **Demo**: Show successful server startup, hit health check endpoint, display connection status

#### **Task 6: Restaurant and Menu APIs (MongoDB focus)**
- **Objective**: Build APIs to fetch restaurants and their customizable menus
- **Implementation**:
  - **Models**:
    - `backend/models/restaurantModel.js`: MySQL queries for restaurant list
    - `backend/models/menuModel.js`: MongoDB queries for menu documents
  - **Endpoints**:
    - `GET /api/restaurants` - List all open restaurants with ratings (MySQL + MongoDB aggregation)
    - `GET /api/restaurants/:id` - Restaurant details
    - `GET /api/menus/:restaurantId` - Full menu with nested categories and customizations
    - `PUT /api/menus/:restaurantId` - Update menu (for restaurant owner)
    - `POST /api/menus/:restaurantId/items` - Add menu item
  - **MongoDB Aggregation**: Calculate average rating per restaurant from reviews collection
  - Join pattern: Fetch restaurant from MySQL, enrich with menu from MongoDB and ratings
- **Tests**: Use Postman/Thunder Client to test all endpoints, verify nested document structure
- **Demo**: Show restaurant list with ratings, display full menu with customizations in JSON

#### **Task 7: Order placement with MySQL transaction**
- **Objective**: Implement atomic order creation with transaction handling
- **Implementation**:
  - **Model**: `backend/models/orderModel.js`
  - **Endpoint**: `POST /api/orders`
  - **Request body**: 
    ```json
    {
      "user_id": 1,
      "restaurant_id": 2,
      "items": [
        {"menu_item_id": "ObjectId", "item_name": "Margherita", "unit_price": 249, "quantity": 2}
      ],
      "delivery_address": "123 Main St",
      "payment_method": "UPI",
      "total_amount": 498
    }
    ```
  - **Transaction logic**:
    1. `BEGIN TRANSACTION`
    2. `INSERT INTO orders` - get order_id
    3. `INSERT INTO order_items` - for each item
    4. `INSERT INTO payments` - with SUCCESS status
    5. `COMMIT TRANSACTION`
    6. If any step fails: `ROLLBACK`
    7. After successful commit: Insert event to MongoDB order_events collection
  - Error handling: Catch errors, rollback, return appropriate HTTP status
  - Log transaction steps for academic demonstration
- **Tests**: Place orders via API, verify all 3 tables populated atomically, test rollback by simulating error
- **Demo**: Place order via Postman, show MySQL tables populated in single transaction, show event in MongoDB

#### **Task 8: Order status management and event logging**
- **Objective**: Build APIs for status updates that sync both databases
- **Implementation**:
  - **Endpoints**:
    - `GET /api/orders/:orderId` - Order details from MySQL
    - `GET /api/orders/:orderId/events` - Event timeline from MongoDB
    - `PUT /api/orders/:orderId/status` - Update status (used by restaurant/delivery)
    - `POST /api/orders/:orderId/assign-partner` - Call stored procedure
  - **Status update logic** (hybrid sync):
    ```javascript
    async function updateOrderStatus(orderId, newStatus, byRole, byId, note) {
      // 1. Update MySQL first (source of truth)
      await mysqlPool.query('UPDATE orders SET status = ? WHERE order_id = ?', [newStatus, orderId]);
      
      // 2. Log event to MongoDB
      try {
        await mongoDb.collection('order_events').insertOne({
          order_id: orderId,
          status: newStatus,
          by_role: byRole,
          by_id: byId,
          timestamp: new Date(),
          note: note
        });
      } catch (err) {
        console.error('Event logging failed, order still valid:', err);
      }
    }
    ```
  - Implement partner assignment: Call `CALL assign_partner(?)`
- **Tests**: Update order status via API, verify MySQL updated, verify event in MongoDB, test partner assignment
- **Demo**: Update order through multiple status changes, show event timeline growing in MongoDB

#### **Task 9: Review and rating system (MongoDB)**
- **Objective**: Implement post-delivery rating functionality
- **Implementation**:
  - **Model**: `backend/models/reviewModel.js`
  - **Endpoints**:
    - `POST /api/reviews` - Submit review (only for delivered orders)
    - `GET /api/reviews/restaurant/:restaurantId` - Get restaurant reviews
  - Validation: Check order status is DELIVERED before allowing review
  - Insert review document to MongoDB
- **Tests**: Submit reviews via API, query reviews, verify validation
- **Demo**: Submit review for delivered order, show review document in MongoDB Compass

#### **Task 10: Admin analytics with aggregations**
- **Objective**: Demonstrate MongoDB aggregation pipeline and MySQL views
- **Implementation**:
  - **Endpoints**:
    - `GET /api/analytics/peak-hours` - MongoDB aggregation on order_events
      ```javascript
      db.order_events.aggregate([
        { $match: { status: "PLACED" } },
        { $project: { hour: { $hour: "$timestamp" } } },
        { $group: { _id: "$hour", count: { $sum: 1 } } },
        { $sort: { count: -1 } }
      ])
      ```
    - `GET /api/analytics/restaurant-revenue` - Query MySQL view
    - `GET /api/analytics/top-rated-restaurants` - MongoDB aggregation on reviews
      ```javascript
      db.reviews.aggregate([
        { $group: { 
          _id: "$restaurant_id", 
          avg_rating: { $avg: "$restaurant_rating" },
          total_reviews: { $sum: 1 }
        }},
        { $sort: { avg_rating: -1 } },
        { $limit: 10 }
      ])
      ```
  - Combine data from both databases for comprehensive analytics
- **Tests**: Call analytics endpoints, verify aggregation results match manual queries
- **Demo**: Show peak hours chart data, restaurant revenue from MySQL view, top-rated restaurants

---

### **Phase 3: Frontend Development (Day 3-4)**

#### **Task 11: React project structure and routing setup**
- **Objective**: Set up React app with Material-UI theme and role-based navigation
- **Implementation**:
  - Configure Material-UI theme with food-delivery color scheme (orange/red primary)
  - Install React Router: `npm install react-router-dom`
  - Create folder structure:
    ```
    frontend/src/
    ├── components/
    │   ├── common/ (Header, Footer, RoleSelector)
    │   ├── customer/ (RestaurantList, MenuView, Cart, OrderTracking)
    │   ├── restaurant/ (OrderQueue, MenuManager)
    │   ├── delivery/ (DeliveryQueue, StatusUpdater)
    │   └── admin/ (AnalyticsDashboard)
    ├── services/ (api.js for axios calls)
    ├── App.js
    └── index.js
    ```
  - Create routing:
    ```javascript
    /customer - Customer dashboard
    /restaurant/:id - Restaurant owner panel
    /delivery/:id - Delivery partner panel
    /admin - Admin analytics
    ```
  - Implement RoleSelector component (dropdown to switch between roles)
  - Create reusable Header with app logo and role selector
- **Tests**: Navigate between routes, verify Material-UI components render
- **Demo**: Show app with navigation working, role selector switching views

#### **Task 12: Customer panel - Restaurant browsing and menu**
- **Objective**: Build customer-facing restaurant list and detailed menu view
- **Implementation**:
  - **RestaurantList component**:
    - Fetch from `/api/restaurants`
    - Display as Material-UI Cards with image, name, rating, city
    - Click to navigate to menu
  - **MenuView component**:
    - Fetch menu from `/api/menus/:restaurantId`
    - Display categories as tabs or sections
    - Each menu item as Card with image, name, price, veg/non-veg badge
    - Click item to open customization dialog
  - **CustomizationDialog**:
    - Show customization options (dropdowns, checkboxes)
    - Add to cart button
  - **Cart component** (side drawer or separate page):
    - List cart items with quantity controls
    - Show total amount
    - Address input field
    - Payment method selector (UPI/Card/COD radio buttons)
    - Place Order button
- **Tests**: Browse restaurants, view menu, add items with customizations to cart, verify cart calculations
- **Demo**: Show restaurant list with real images, open menu with customization options, add items to cart

#### **Task 13: Customer panel - Order placement and tracking**
- **Objective**: Implement checkout flow and real-time order tracking
- **Implementation**:
  - **Checkout flow**:
    - On "Place Order": Show mock payment confirmation dialog
    - Dialog: "Confirm payment of ₹XXX via UPI?" with Confirm/Cancel
    - On confirm: POST to `/api/orders`
    - Show success message with order ID
    - Navigate to OrderTracking page
  - **OrderTracking component**:
    - Fetch order details from `/api/orders/:orderId`
    - Fetch event timeline from `/api/orders/:orderId/events`
    - Display order summary (items, amount, address)
    - Display status timeline using Material-UI Stepper or Timeline component:
      - PLACED → ACCEPTED → PREPARING → PICKED_UP → DELIVERED
      - Show timestamps for each completed step
      - Highlight current status
    - Add refresh button (or poll every 10 seconds)
    - If status is DELIVERED, show "Rate Order" button
- **Tests**: Place order, verify tracking page shows correct status, update status from backend and refresh to see changes
- **Demo**: Complete order placement with mock payment, show order tracking with timeline

#### **Task 14: Customer panel - Rating and review**
- **Objective**: Allow customers to rate completed orders
- **Implementation**:
  - **RatingDialog component**:
    - Only shown if order status is DELIVERED
    - Two star ratings: Restaurant (1-5 stars), Delivery (1-5 stars)
    - Text field for comment
    - Submit button
  - POST to `/api/reviews`
  - Show success message, disable rating button after submission
- **Tests**: Rate a delivered order, verify review appears in MongoDB
- **Demo**: Open rating dialog, submit review with ratings and comment, show in database

#### **Task 15: Restaurant owner panel**
- **Objective**: Build order management and menu editing interface
- **Implementation**:
  - **Order queue component**:
    - Fetch orders for this restaurant: `/api/orders?restaurant_id=X&status=PLACED`
    - Display as list/table with order details (items, amount, address)
    - Accept button: Updates status to ACCEPTED
    - Reject button: Updates status to REJECTED
    - Show all orders in tabs: Incoming, Accepted, Preparing, Completed
  - **Menu manager component**:
    - Fetch current menu: `/api/menus/:restaurantId`
    - Display categories and items in editable format
    - Add item button: Opens dialog with fields (name, price, veg, customizations)
    - Edit/Delete buttons for existing items
    - PUT to `/api/menus/:restaurantId` to save changes
- **Tests**: Accept/reject orders, verify status changes, add menu item and verify in MongoDB
- **Demo**: Show incoming order, accept it, add new menu item with customizations

#### **Task 16: Delivery partner panel**
- **Objective**: Build delivery acceptance and status update interface
- **Implementation**:
  - **Available deliveries component**:
    - Fetch orders: `/api/orders?status=ACCEPTED&partner_id=null`
    - Display list with restaurant, delivery address, amount
    - Accept button: Calls `/api/orders/:orderId/assign-partner`
  - **My deliveries component**:
    - Fetch orders: `/api/orders?partner_id=X&status=PICKED_UP,PREPARING`
    - Show current delivery details
    - "Picked Up" button: Updates status to PICKED_UP
    - "Delivered" button: Updates status to DELIVERED
    - Show delivery history
- **Tests**: Accept delivery, update to picked up, mark as delivered, verify events logged
- **Demo**: Show available orders, accept one, update through delivery stages

#### **Task 17: Admin analytics dashboard**
- **Objective**: Visualize analytics from both databases
- **Implementation**:
  - **Dashboard layout** using Material-UI Grid:
    - Cards showing: Total orders, Total revenue, Active restaurants, Active delivery partners
  - **Peak hours chart**:
    - Fetch from `/api/analytics/peak-hours`
    - Display as bar chart (can use recharts library: `npm install recharts`)
    - X-axis: Hour (0-23), Y-axis: Order count
  - **Restaurant revenue table**:
    - Fetch from `/api/analytics/restaurant-revenue`
    - Display as Material-UI Table sorted by revenue
  - **Top-rated restaurants**:
    - Fetch from `/api/analytics/top-rated-restaurants`
    - Display as cards with star ratings
- **Tests**: Open admin dashboard, verify all analytics load correctly
- **Demo**: Show complete analytics dashboard with charts and tables, explain data sources

---

### **Phase 4: Integration, Testing & Documentation (Day 5)**

#### **Task 18: End-to-end integration testing**
- **Objective**: Test complete user workflows across all panels
- **Implementation**:
  - **Workflow 1: Complete order journey**:
    1. Customer: Browse → Select items → Place order → Track
    2. Restaurant: Accept order → Update to preparing
    3. Delivery: Accept delivery → Pick up → Deliver
    4. Customer: Rate order
    5. Admin: View in analytics
  - **Workflow 2: Menu management**:
    1. Restaurant: Add new item with customizations
    2. Customer: Order the new item
    3. Verify MongoDB and MySQL data consistency
  - **Workflow 3: Payment refund trigger**:
    1. Place order successfully
    2. In MySQL, manually update payment status to REFUNDED
    3. Verify trigger auto-cancels the order
  - Test edge cases:
    - Order with no available partners
    - Restaurant rejecting order
    - Invalid menu items
  - Document any bugs and fix them
- **Tests**: Run all workflows, create test checklist, verify data consistency
- **Demo**: Perform complete order journey live, show data in both databases at each step

#### **Task 19: DBMS concepts documentation and presentation prep**
- **Objective**: Create comprehensive documentation for academic presentation
- **Implementation**:
  - Create `DBMS_CONCEPTS.md` document explaining:
    - **Normalization**: Why MySQL schema is in 3NF with examples
    - **Transaction**: Show order placement code, explain ACID properties
    - **Trigger**: Explain cancel_order_on_refund trigger, show execution
    - **View**: Explain restaurant_revenue view, show query plan
    - **Stored Procedure**: Explain assign_partner procedure, show execution
    - **Indexes**: Show explain() output before/after indexes in MongoDB
    - **Aggregation**: Explain peak hours aggregation pipeline step-by-step
    - **Hybrid architecture**: Why we split data between MySQL and MongoDB
  - Create `ARCHITECTURE.md` with system diagrams
  - Create `API_DOCUMENTATION.md` listing all endpoints with examples
  - Create `SETUP_GUIDE.md` with steps to run the project
  - Prepare SQL scripts to demonstrate each concept during viva
  - Create PowerPoint/slides if needed
- **Tests**: Review documentation for accuracy and completeness
- **Demo**: Present documentation, explain each DBMS concept with live examples

#### **Task 20: Code cleanup, README, and deployment preparation**
- **Objective**: Polish codebase and prepare for demonstration
- **Implementation**:
  - Code cleanup:
    - Add comments explaining complex logic
    - Remove console.logs and debug code
    - Format code consistently
    - Add error messages that are user-friendly
  - Create comprehensive `README.md`:
    - Project overview and architecture
    - Prerequisites (Node.js, npm, AWS account, MongoDB Atlas account)
    - AWS RDS setup instructions (step-by-step with screenshots)
    - MongoDB Atlas setup instructions (step-by-step)
    - Environment variables setup
    - Installation steps (`npm install` for both backend and frontend)
    - Database initialization (run schema.sql and seed.js)
    - Running the application (`npm start` commands)
    - Testing guide
    - Screenshots of each panel
    - DBMS concepts covered
    - Troubleshooting common issues
  - Create `.env.example` files
  - Test fresh installation by following README on different machine/VM
  - Optional: Deploy frontend to Vercel/Netlify and backend to Heroku/Railway for online demo
  - Create backup SQL dump and MongoDB export for safety
- **Tests**: Follow README from scratch to verify setup works, test all features one final time
- **Demo**: Show complete working application, present to faculty, handle Q&A about DBMS concepts

---

## **Timeline Summary**

| Day | Phase | Tasks | Deliverables |
|-----|-------|-------|--------------|
| **Day 1** | Environment & Database Design | Tasks 1-4 | AWS RDS + MongoDB Atlas setup, Complete MySQL schema with trigger/view/procedure, MongoDB collections with indexes, Seed data |
| **Day 2** | Backend API (Part 1) | Tasks 5-7 | Database connections, Restaurant/Menu APIs, Order placement with transactions |
| **Day 3** | Backend API (Part 2) + Frontend Start | Tasks 8-11 | Status management, Reviews, Analytics APIs, React setup with routing |
| **Day 4** | Frontend Development | Tasks 12-17 | All 4 user panels complete (Customer, Restaurant, Delivery, Admin) |
| **Day 5** | Integration & Documentation | Tasks 18-20 | End-to-end testing, DBMS documentation, README, Final polish |

---

## **Key DBMS Concepts Demonstrated**

### **MySQL (Relational Database)**
1. ✅ **Normalization (3NF)**: All tables properly normalized, no transitive dependencies
2. ✅ **Transactions**: Order placement uses BEGIN/COMMIT/ROLLBACK
3. ✅ **Triggers**: Auto-cancel order on payment refund
4. ✅ **Views**: Restaurant revenue calculation
5. ✅ **Stored Procedures**: Partner assignment logic
6. ✅ **Foreign Keys**: Referential integrity maintained
7. ✅ **Joins**: Order history with restaurant details
8. ✅ **Subqueries**: Top customers, revenue analytics

### **MongoDB (Document Database)**
1. ✅ **Embedded Documents**: Menus with nested customizations
2. ✅ **Aggregation Pipeline**: Peak hours, average ratings
3. ✅ **Indexes**: Performance optimization with explain()
4. ✅ **Flexible Schema**: Menu items can have different customization structures
5. ✅ **Time-series Data**: Order events log

### **Hybrid Architecture**
1. ✅ **Data Partitioning**: Transactional vs flexible schema data
2. ✅ **Cross-database References**: Storing IDs across systems
3. ✅ **Consistency Strategy**: MySQL as source of truth
4. ✅ **Eventual Consistency**: Event logging can lag without breaking orders

---

## **Success Criteria**

✅ All 4 user panels functional with professional UI  
✅ Complete order lifecycle from placement to delivery to rating  
✅ All 6 MySQL tables with relationships working  
✅ All 3 MongoDB collections with proper schemas  
✅ Transaction demonstrated with rollback capability  
✅ Trigger, view, and stored procedure working  
✅ MongoDB aggregations providing analytics  
✅ Indexes improving query performance (proven with explain())  
✅ Hybrid database sync working correctly  
✅ AWS RDS and MongoDB Atlas successfully configured  
✅ Comprehensive documentation for academic presentation  
✅ Clean, commented code ready for faculty review  

---

## **Potential Challenges & Solutions**

| Challenge | Solution |
|-----------|----------|
| AWS RDS costs | Set billing alert, use free tier, stop instance when not in use |
| Connection issues to cloud DBs | Use IP whitelisting, test connection strings, check security groups |
| Transaction rollback not working | Use `mysql2/promise` with proper try-catch, test with intentional errors |
| MongoDB ObjectId references | Store as string in MySQL, convert with `ObjectId(string)` when querying |
| React CORS issues | Configure CORS middleware in Express properly |
| Large menu documents | Limit categories/items per restaurant, use projection to fetch only needed fields |
| Time constraint | Focus on must-have features first, simplify nice-to-have features |

---

## **Project Structure**

```
DBMS mini project/
├── backend/
│   ├── config/
│   │   ├── database.js
│   │   └── env.js
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── scripts/
│   │   ├── schema.sql
│   │   ├── mongodb-setup.js
│   │   └── seed.js
│   ├── server.js
│   ├── package.json
│   └── .env
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── services/
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
├── docs/
│   ├── DBMS_CONCEPTS.md
│   ├── ARCHITECTURE.md
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
├── IMPLEMENTATION_PLAN.md
├── README.md
└── .gitignore
```
