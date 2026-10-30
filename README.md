# Food Delivery System - Hybrid Database Architecture

A full-stack food delivery application demonstrating hybrid database architecture using **MySQL (AWS RDS)** for transactional data and **MongoDB (Atlas)** for flexible schema data. Built for academic demonstration of core DBMS concepts.

![Project Status](https://img.shields.io/badge/status-in%20development-yellow)
![MySQL](https://img.shields.io/badge/MySQL-8.0-blue)
![MongoDB](https://img.shields.io/badge/MongoDB-6.0-green)
![Node.js](https://img.shields.io/badge/Node.js-18.x-brightgreen)
![React](https://img.shields.io/badge/React-18.x-61DAFB)

---

## 📋 Table of Contents

- [Project Overview](#project-overview)
- [Architecture](#architecture)
- [DBMS Concepts Demonstrated](#dbms-concepts-demonstrated)
- [Technology Stack](#technology-stack)
- [Prerequisites](#prerequisites)
- [Installation](#installation)
- [Database Setup](#database-setup)
- [Running the Application](#running-the-application)
- [Project Structure](#project-structure)
- [Features](#features)
- [API Documentation](#api-documentation)
- [Screenshots](#screenshots)
- [Academic Presentation Notes](#academic-presentation-notes)
- [Troubleshooting](#troubleshooting)
- [Contributors](#contributors)

---

## 🎯 Project Overview

This project implements a complete food delivery system with **four user roles** (Customer, Restaurant Owner, Delivery Partner, Admin) using a **hybrid database architecture**. The system demonstrates why and how to use the right database for the right data:

- **MySQL** for orders, payments, users → ACID transactions, strong consistency
- **MongoDB** for menus, event logs, reviews → Flexible schemas, fast writes

### Why Hybrid?

- **Transactional Integrity**: Order and payment data requires ACID guarantees
- **Schema Flexibility**: Restaurant menus with nested customizations fit document model better
- **Performance**: Event logging benefits from MongoDB's fast append-only writes
- **Real-World Pattern**: Mirrors architecture used by major food delivery platforms

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                React Frontend (Material-UI)                  │
│   Customer | Restaurant Owner | Delivery Partner | Admin    │
└─────────────────────────────────────────────────────────────┘
                            ↕ REST API
┌─────────────────────────────────────────────────────────────┐
│              Node.js + Express Backend                       │
│                                                              │
│  Business Logic Layer (Services)                            │
│  Database Access Layer (Models)                             │
└─────────────────────────────────────────────────────────────┘
              ↕                              ↕
    ┌──────────────────┐          ┌──────────────────┐
    │  MySQL (AWS RDS) │          │ MongoDB (Atlas)  │
    │                  │          │                  │
    │ • users          │          │ • menus          │
    │ • restaurants    │          │ • order_events   │
    │ • orders         │          │ • reviews        │
    │ • payments       │          │                  │
    └──────────────────┘          └──────────────────┘
```

### Data Flow: Place Order

```
1. Customer selects items from menu (MongoDB)
2. Backend validates items exist
3. MySQL Transaction begins
4. Insert order → order_items → payment (MySQL)
5. Transaction commits
6. Log "PLACED" event to MongoDB
7. Return success to customer
```

---

## 📚 DBMS Concepts Demonstrated

### MySQL Concepts

| Concept | Implementation | Location |
|---------|---------------|----------|
| **3NF Normalization** | All tables properly normalized, no transitive dependencies | `schema.sql` - All tables |
| **Transactions** | Order placement with atomicity (INSERT order + items + payment) | `orderModel.js` |
| **Trigger** | Auto-cancel order when payment is refunded | `schema.sql` - `cancel_order_on_refund` |
| **View** | Restaurant revenue aggregation | `schema.sql` - `restaurant_revenue` |
| **Stored Procedure** | Assign available delivery partner | `schema.sql` - `assign_partner` |
| **Foreign Keys** | Referential integrity across tables | `schema.sql` - All FKs |
| **Joins** | Order history with restaurant/user details | `orderModel.js` |
| **Subqueries** | Top customers, revenue analytics | Analytics queries |

### MongoDB Concepts

| Concept | Implementation | Location |
|---------|---------------|----------|
| **Embedded Documents** | Menus with nested categories & customizations | `menus` collection |
| **Aggregation Pipeline** | Peak order hours, average ratings | `analyticsModel.js` |
| **Indexes** | Performance optimization on order_id, timestamp | `mongodb-setup.js` |
| **Schema Validation** | JSON Schema for collection validation | `mongodb-setup.js` |
| **Time-Series Data** | Order event log (append-only) | `order_events` collection |
| **explain()** | Query performance analysis | Test scripts |

### Hybrid Architecture Concepts

- **Cross-Database References**: Storing MySQL IDs in MongoDB documents
- **Eventual Consistency**: Event logging can lag without breaking orders
- **Source of Truth Pattern**: MySQL for order state, MongoDB for audit trail
- **Polyglot Persistence**: Using multiple database types in one system

---

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js 18.x
- **Framework**: Express.js 4.x
- **MySQL Driver**: mysql2 (with promise support)
- **MongoDB Driver**: mongodb (official Node.js driver)
- **Environment**: dotenv for configuration

### Frontend
- **Library**: React 18.x
- **UI Framework**: Material-UI (MUI) 5.x
- **Routing**: React Router v6
- **HTTP Client**: Axios
- **Charts**: Recharts (for analytics)

### Databases
- **MySQL 8.0**: AWS RDS (Free Tier)
- **MongoDB 6.0**: MongoDB Atlas M0 Cluster (Free)

### Development Tools
- **MySQL Workbench**: Schema visualization and queries
- **MongoDB Compass**: Collection browsing and aggregations
- **Postman/Thunder Client**: API testing

---

## ✅ Prerequisites

Before you begin, ensure you have:

1. **Node.js** (v18 or later) - [Download](https://nodejs.org/)
2. **npm** (comes with Node.js)
3. **Git** (optional, for cloning)
4. **AWS Account** - [Sign Up](https://aws.amazon.com/)
5. **MongoDB Atlas Account** - [Sign Up](https://www.mongodb.com/cloud/atlas/register)
6. **MySQL Workbench** - [Download](https://dev.mysql.com/downloads/workbench/)
7. **MongoDB Compass** - [Download](https://www.mongodb.com/try/download/compass)

### Check Installations

```bash
node --version    # Should show v18.x or higher
npm --version     # Should show v9.x or higher
```

---

## 📥 Installation

### Step 1: Clone or Download the Project

```bash
# If using Git
git clone <repository-url>
cd "DBMS mini project"

# Or download and extract ZIP file
```

### Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This installs:
- express
- mysql2
- mongodb
- dotenv
- cors
- body-parser
- nodemon (dev dependency)

### Step 3: Install Frontend Dependencies

```bash
cd ../frontend
npm install
```

This installs:
- react
- react-dom
- react-router-dom
- @mui/material
- @mui/icons-material
- @emotion/react
- @emotion/styled
- axios
- recharts

---

## 🗄️ Database Setup

### Step 1: Set Up Cloud Databases

Follow the detailed guide: **[docs/CLOUD_SETUP_GUIDE.md](docs/CLOUD_SETUP_GUIDE.md)**

This guide covers:
- AWS RDS MySQL setup (with screenshots)
- MongoDB Atlas cluster creation
- Security group configuration
- Network access setup
- Connection testing

### Step 2: Configure Environment Variables

1. Copy the example file:
```bash
cd backend
copy .env.example .env    # Windows
# or
cp .env.example .env      # Mac/Linux
```

2. Edit `.env` with your database credentials:

```env
# MySQL Configuration (AWS RDS)
MYSQL_HOST=your-rds-endpoint.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_secure_password
MYSQL_DATABASE=food_delivery

# MongoDB Configuration (Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_delivery?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development
```

⚠️ **Important**: Never commit the `.env` file to version control!

### Step 3: Initialize MySQL Schema

**Option A: Using MySQL Workbench (Recommended)**

1. Open MySQL Workbench
2. Connect to your AWS RDS instance
3. File → Open SQL Script
4. Navigate to `backend/scripts/schema.sql`
5. Click Execute (⚡ icon)
6. Verify all tables, views, procedures, and triggers are created

**Option B: Using Command Line**

```bash
mysql -h your-rds-endpoint.rds.amazonaws.com -u admin -p food_delivery < backend/scripts/schema.sql
```

### Step 4: Set Up MongoDB Collections and Indexes

```bash
cd backend
node scripts/mongodb-setup.js
```

Expected output:
```
✅ menus collection created with validation
✅ order_events collection created with validation
✅ reviews collection created with validation
✅ Indexes created for optimal query performance
```

### Step 5: Seed Sample Data

```bash
cd backend
node scripts/seed.js
```

This populates:
- **MySQL**: 10 users, 5 restaurants, 3 delivery partners, 7 orders
- **MongoDB**: 5 menus (25+ items), 24+ events, 3 reviews

Expected output:
```
✅ MySQL connected
✅ MongoDB connected
✅ Database seeding complete!
```

### Step 6: Verify Data

**MySQL (using Workbench):**
```sql
USE food_delivery;
SHOW TABLES;
SELECT * FROM users;
SELECT * FROM restaurants;
SELECT * FROM restaurant_revenue;  -- Test view
CALL assign_partner(5);            -- Test stored procedure
```

**MongoDB (using Compass):**
- Connect using your connection string
- Browse collections: `menus`, `order_events`, `reviews`
- Run aggregation:
```javascript
db.reviews.aggregate([
  { $group: { _id: "$restaurant_id", avg: { $avg: "$restaurant_rating" } } }
])
```

---

## 🚀 Running the Application

### Start Backend Server

```bash
cd backend
npm start
```

Expected output:
```
✅ MySQL connected successfully
✅ MongoDB connected successfully
✅ Server running on port 5000
🌐 API URL: http://localhost:5000
💚 Health check: http://localhost:5000/health
```

**Test the backend:**

Open browser and visit: `http://localhost:5000/health`

You should see:
```json
{
  "status": "healthy",
  "timestamp": "2024-10-21T...",
  "databases": {
    "mysql": "connected",
    "mongodb": "connected"
  }
}
```

### Start Frontend (Coming in Phase 3)

```bash
cd frontend
npm start
```

The React app will open at: `http://localhost:3000`

---

## 📁 Project Structure

```
DBMS mini project/
│
├── backend/
│   ├── config/
│   │   ├── database.js          # MySQL & MongoDB connections
│   │   └── env.js                # Environment variable validation
│   │
│   ├── controllers/              # Business logic layer
│   │   ├── restaurantController.js
│   │   ├── orderController.js
│   │   ├── menuController.js
│   │   └── analyticsController.js
│   │
│   ├── models/                   # Database access layer
│   │   ├── restaurantModel.js   # MySQL queries
│   │   ├── menuModel.js         # MongoDB queries
│   │   ├── orderModel.js        # Hybrid (both DBs)
│   │   └── analyticsModel.js
│   │
│   ├── routes/                   # API route definitions
│   │   ├── restaurants.js
│   │   ├── menus.js
│   │   ├── orders.js
│   │   └── analytics.js
│   │
│   ├── scripts/                  # Database setup scripts
│   │   ├── schema.sql           # MySQL schema with triggers/views
│   │   ├── mongodb-setup.js     # MongoDB collections & indexes
│   │   └── seed.js              # Populate both databases
│   │
│   ├── server.js                 # Express app entry point
│   ├── package.json
│   ├── .env                      # Environment variables (git-ignored)
│   └── .env.example              # Template for .env
│
├── frontend/
│   ├── public/
│   │   └── index.html
│   │
│   ├── src/
│   │   ├── components/
│   │   │   ├── common/          # Header, Footer, RoleSelector
│   │   │   ├── customer/        # Customer panel components
│   │   │   ├── restaurant/      # Restaurant owner panel
│   │   │   ├── delivery/        # Delivery partner panel
│   │   │   └── admin/           # Admin dashboard
│   │   │
│   │   ├── services/
│   │   │   └── api.js           # Axios API calls
│   │   │
│   │   ├── App.js               # Main app with routing
│   │   └── index.js             # React entry point
│   │
│   └── package.json
│
├── docs/
│   ├── CLOUD_SETUP_GUIDE.md      # AWS RDS & MongoDB Atlas setup
│   ├── DBMS_CONCEPTS.md          # Detailed concept explanations
│   ├── ARCHITECTURE.md           # System design diagrams
│   └── API_DOCUMENTATION.md      # API endpoint reference
│
├── IMPLEMENTATION_PLAN.md         # 5-day task breakdown
├── README.md                      # This file
└── .gitignore                     # Git ignore rules
```

---

## ✨ Features

### Customer Panel
- ✅ Browse restaurants by cuisine, city, rating
- ✅ View restaurant menus with nested categories
- ✅ Add items to cart with customizations (size, toppings, spice level)
- ✅ Place order with mock payment confirmation
- ✅ Track order status with real-time timeline
- ✅ Rate restaurant and delivery after completion

### Restaurant Owner Panel
- ✅ View incoming orders (PLACED status)
- ✅ Accept or reject orders
- ✅ Update order status to PREPARING
- ✅ Manage menu: Add/edit/delete items
- ✅ Add customization options to menu items
- ✅ View order history and revenue

### Delivery Partner Panel
- ✅ View available deliveries (ACCEPTED orders)
- ✅ Accept delivery assignment
- ✅ Update status: PICKED_UP → DELIVERED
- ✅ View delivery history
- ✅ Automatic availability management

### Admin Dashboard
- ✅ Peak order hours analysis (bar chart)
- ✅ Restaurant revenue table (from MySQL view)
- ✅ Top-rated restaurants (MongoDB aggregation)
- ✅ System statistics: Total orders, revenue, active users

---

## 📡 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Restaurants

```http
GET /api/restaurants
Response: List of all restaurants with ratings

GET /api/restaurants/:id
Response: Single restaurant details
```

### Menus

```http
GET /api/menus/:restaurantId
Response: Full menu with categories and items (MongoDB)

PUT /api/menus/:restaurantId
Body: Updated menu document
Response: Success message
```

### Orders

```http
POST /api/orders
Body: { user_id, restaurant_id, items[], delivery_address, payment_method, total_amount }
Response: { order_id, success }

GET /api/orders/:orderId
Response: Order details (MySQL)

GET /api/orders/:orderId/events
Response: Event timeline (MongoDB)

PUT /api/orders/:orderId/status
Body: { status, by_role, by_id, note }
Response: Success message

POST /api/orders/:orderId/assign-partner
Response: { assigned_partner_id }
```

### Reviews

```http
POST /api/reviews
Body: { order_id, user_id, restaurant_id, restaurant_rating, delivery_rating, comment }
Response: { review_id }

GET /api/reviews/restaurant/:restaurantId
Response: Array of reviews
```

### Analytics

```http
GET /api/analytics/peak-hours
Response: Array of { hour, order_count }

GET /api/analytics/restaurant-revenue
Response: Array from MySQL view

GET /api/analytics/top-rated-restaurants
Response: Array from MongoDB aggregation
```

Full API documentation: [docs/API_DOCUMENTATION.md](docs/API_DOCUMENTATION.md)

---

## 🎓 Academic Presentation Notes

### For Faculty Demonstration

**1. Start with the problem:**
   - "Why do food delivery apps need both SQL and NoSQL?"
   - Show real-world examples (Swiggy, Zomato, UberEats use polyglot persistence)

**2. Explain the design:**
   - Draw the architecture diagram on board
   - Explain which data goes where and why

**3. Demonstrate DBMS concepts:**

   **Normalization (MySQL):**
   ```sql
   -- Show tables in 3NF
   DESCRIBE orders;
   DESCRIBE order_items;
   -- Explain: order_items.item_name is intentionally denormalized
   ```

   **Transaction (Code walkthrough):**
   ```javascript
   // Show orderModel.js transaction code
   // Explain ACID properties
   // Demo: Rollback on payment failure
   ```

   **Trigger (Live demo):**
   ```sql
   -- Before
   SELECT order_id, status FROM orders WHERE order_id = 1;
   -- Trigger the refund
   UPDATE payments SET status = 'REFUNDED' WHERE order_id = 1;
   -- After - order should be CANCELLED
   SELECT order_id, status FROM orders WHERE order_id = 1;
   ```

   **View (Performance):**
   ```sql
   -- Complex query
   SELECT r.name, COUNT(o.order_id), SUM(o.total_amount)
   FROM restaurants r
   JOIN orders o ON r.restaurant_id = o.restaurant_id
   WHERE o.status = 'DELIVERED'
   GROUP BY r.restaurant_id;

   -- Simplified with view
   SELECT * FROM restaurant_revenue;
   ```

   **Stored Procedure:**
   ```sql
   CALL assign_partner(5);
   -- Show how it updates both orders and delivery_partners tables
   ```

   **MongoDB Aggregation:**
   ```javascript
   // Peak hours aggregation
   db.order_events.aggregate([
     { $match: { status: "PLACED" } },
     { $project: { hour: { $hour: "$timestamp" } } },
     { $group: { _id: "$hour", count: { $sum: 1 } } },
     { $sort: { count: -1 } }
   ])
   ```

   **Index Performance:**
   ```javascript
   // Without index
   db.order_events.find({ order_id: 1 }).explain("executionStats");
   
   // With index - show faster execution
   ```

**4. Show the working application:**
   - Complete order journey across all four panels
   - Show data appearing in both databases in real-time

**5. Discuss trade-offs:**
   - Why not all in MySQL? (Menu schema flexibility)
   - Why not all in MongoDB? (Transaction guarantees)
   - Eventual consistency in event logging

### Questions Faculty Might Ask

**Q: Why denormalize item_name and unit_price in order_items?**  
A: To preserve historical data. If a restaurant changes menu prices, past orders shouldn't change. This is intentional denormalization for temporal data integrity.

**Q: What if MongoDB write fails after MySQL commit?**  
A: MySQL is the source of truth for the order. MongoDB event can be backfilled later. We log the error and continue. The order is still valid.

**Q: Can you add indexing to MySQL?**  
A: Yes! Schema already has indexes on foreign keys, status fields, and timestamps. I can show EXPLAIN output for queries.

**Q: How do you handle concurrent partner assignment?**  
A: The stored procedure uses SELECT...FOR UPDATE (row-level locking) to prevent two orders from getting the same partner.

**Q: What normal form is your schema in?**  
A: 3NF. No transitive dependencies. For example, restaurant details are in restaurants table, not in orders. User details in users, not duplicated across tables.

---

## 🐛 Troubleshooting

### Backend won't start

**Error: "Missing required environment variables"**
- Check that `.env` file exists in `backend` folder
- Verify all required variables are set (see `.env.example`)

**Error: "MySQL connection failed: ETIMEDOUT"**
- Check AWS RDS security group allows port 3306
- Verify your IP is whitelisted
- Confirm RDS instance is "Available" status

**Error: "MongoDB connection failed: Authentication failed"**
- Check connection string has correct password
- Verify MongoDB Atlas user has "readWrite" permissions
- Confirm network access includes your IP

### Schema creation fails

**Error: "Unknown database 'food_delivery'"**
- Create database manually in MySQL Workbench:
  ```sql
  CREATE DATABASE food_delivery;
  ```

**Error: "Delimiter syntax error"**
- Use MySQL Workbench to run schema.sql
- It handles DELIMITER statements properly

### Seed script fails

**Error: "Foreign key constraint fails"**
- Run schema.sql first to create all tables
- Seed script handles foreign key checks automatically

**Error: "E11000 duplicate key error" (MongoDB)**
- Clear MongoDB collections:
  ```javascript
  db.menus.deleteMany({});
  db.order_events.deleteMany({});
  db.reviews.deleteMany({});
  ```
- Run seed script again

### Frontend issues

**Error: "Network Error" when calling API**
- Check backend is running on port 5000
- Verify CORS is enabled in Express
- Check API URL in frontend services/api.js

---

## 🤝 Contributors

- **[Your Name]** - Developer
- **[Team Member 2]** - Database Design
- **[Team Member 3]** - Frontend Development

---

## 📜 License

This project is created for academic purposes as part of Database Management Systems coursework.

---

## 🙏 Acknowledgments

- Thanks to [University Name] for project guidance
- AWS Free Tier for RDS hosting
- MongoDB Atlas for free M0 cluster
- Material-UI for React components

---

## 📞 Support

For issues or questions:
1. Check [Troubleshooting](#troubleshooting) section
2. Review [docs/CLOUD_SETUP_GUIDE.md](docs/CLOUD_SETUP_GUIDE.md)
3. Contact: [your-email@example.com]

---

## 🚀 Next Steps

- [ ] Complete backend API endpoints (Tasks 5-10)
- [ ] Build React frontend (Tasks 11-17)
- [ ] End-to-end testing (Task 18)
- [ ] Create presentation materials (Task 19)
- [ ] Final polish and documentation (Task 20)

---

**⭐ Star this project if it helps with your DBMS coursework!**
