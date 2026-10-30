# 🚀 Food Delivery System - Setup Instructions

## 📋 Prerequisites

Before running this project, ensure you have installed:

- **Node.js** (v18 or higher) - [Download here](https://nodejs.org/)
- **MySQL** (v8.0 or higher) - AWS RDS or Local installation
- **MongoDB** (v6.0 or higher) - MongoDB Atlas or Local installation
- **npm** (comes with Node.js)

---

## 🔧 Initial Setup

### Step 1: Clone/Download the Project
```bash
# If downloaded as ZIP, extract it
# Navigate to project folder
cd "DBMS mini project"
```

### Step 2: Configure Environment Variables

1. Navigate to backend folder:
   ```bash
   cd backend
   ```

2. Copy the example environment file:
   ```bash
   # Windows
   copy .env.example .env
   
   # macOS/Linux
   cp .env.example .env
   ```

3. Open `backend/.env` in a text editor and fill in your credentials:

   ```env
   # MySQL Configuration (AWS RDS or Local)
   MYSQL_HOST=your-mysql-host.com
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=food_delivery

   # MongoDB Configuration (Atlas or Local)
   # For MongoDB Atlas:
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_delivery
   
   # For Local MongoDB:
   # MONGODB_URI=mongodb://localhost:27017/food_delivery

   # Server Configuration
   PORT=5000
   NODE_ENV=development
   ```

---

## 📦 Install Dependencies

### Backend Dependencies
```bash
cd backend
npm install
```

**Packages installed:**
- express (Web framework)
- mysql2 (MySQL client)
- mongodb (MongoDB driver)
- cors (Cross-Origin Resource Sharing)
- dotenv (Environment variables)
- body-parser (Request body parsing)

### Frontend Dependencies
```bash
cd ../frontend
npm install
```

**Packages installed:**
- react (UI library)
- react-router-dom (Routing)
- axios (HTTP client)
- @mui/material (Material-UI components)

---

## 🗄️ Database Setup

### Step 1: Create MySQL Database

If using **AWS RDS:**
1. Create a MySQL instance on AWS RDS
2. Note down the endpoint, username, and password
3. Ensure security group allows your IP address

If using **Local MySQL:**
```sql
CREATE DATABASE food_delivery;
```

### Step 2: Run Schema Creation
```bash
cd backend
node scripts/init-database.js
```

This will create:
- 6 tables (users, restaurants, delivery_partners, orders, order_items, payments)
- 1 trigger (cancel_order_on_refund)
- 3 views (restaurant_revenue, top_customers, active_deliveries)
- 2 stored procedures (assign_partner, complete_delivery)

### Step 3: Seed Sample Data
```bash
node scripts/seed.js
```

This will populate:
- 10 users (customers, owners, partners, admin)
- 5 restaurants
- 20+ sample orders
- Restaurant menus (MongoDB)
- Sample reviews (MongoDB)

---

## ▶️ Running the Application

### Terminal 1: Start Backend Server
```bash
cd backend
node server.js
```

You should see:
```
🚀 Starting Food Delivery System API...
✅ MySQL connected successfully
✅ MongoDB connected successfully
✅ Server running on port 5000
```

### Terminal 2: Start Frontend Development Server
```bash
cd frontend
npm start
```

Browser should automatically open to: **http://localhost:3000**

---

## 🌐 Accessing the Application

Open your browser and go to: **http://localhost:3000**

### Available Users (for testing)

**Customer:**
- Email: rahul@example.com
- (No login system, just select role)

**Restaurant Owner:**
- Email: vikram@example.com
- Restaurant: Spice Garden

**Delivery Partner:**
- Email: arjun@example.com
- Vehicle: Bike

**Admin:**
- Email: admin@example.com
- Full system access

---

## 📱 Application Features

### Customer:
- Browse restaurants
- View menus
- Add items to cart
- Place orders
- Track order status
- View order history

### Restaurant Owner:
- View incoming orders
- Accept/Reject orders
- Update order status (Preparing, Ready for Pickup)
- View restaurant statistics

### Delivery Partner:
- View available deliveries
- Accept delivery orders
- Update delivery status (Picked Up, Delivered)
- Track earnings

### Admin:
- System-wide analytics
- Monitor all orders
- View restaurant performance
- User management

---

## 🧪 Testing

### Test Database Connection
```bash
cd backend
node test-connection.js
```

### Test APIs
```bash
# Test all MySQL endpoints
node test-apis.js

# Test MongoDB endpoints
node test-mongodb-apis.js

# Test analytics endpoints
node test-analytics.js
```

---

## 🛠️ Database Tools (Optional)

### DBeaver (For MySQL)
1. Download: https://dbeaver.io/
2. Connect to your MySQL database
3. View tables, run queries, export data

### MongoDB Compass (For MongoDB)
1. Download: https://www.mongodb.com/products/compass
2. Connect using your MongoDB URI
3. View collections, run aggregations

---

## 🐛 Troubleshooting

### Backend won't start:
- Check `.env` file has correct credentials
- Verify MySQL and MongoDB are running
- Check ports 5000 is not in use: `netstat -ano | findstr :5000`

### Frontend won't start:
- Delete `node_modules` and `package-lock.json`
- Run `npm install` again
- Check port 3000 is available

### Database connection errors:
- Verify database credentials in `.env`
- For AWS RDS: Check security group inbound rules
- For MongoDB Atlas: Whitelist your IP address
- Run `node test-connection.js` to diagnose

### "Cannot find module" errors:
- Run `npm install` in both backend and frontend folders
- Check `node_modules` folder exists

---

## 📂 Project Structure

```
DBMS mini project/
├── backend/
│   ├── config/           # Database configuration
│   ├── controllers/      # Business logic
│   ├── models/          # Database queries
│   ├── routes/          # API endpoints
│   ├── scripts/         # Setup and seed scripts
│   ├── .env.example     # Environment template
│   ├── server.js        # Entry point
│   └── package.json
├── frontend/
│   ├── public/          # Static files
│   ├── src/
│   │   ├── components/  # React components
│   │   ├── pages/       # Page components
│   │   ├── contexts/    # React contexts
│   │   ├── App.js       # Main app
│   │   └── api.js       # API client
│   └── package.json
└── docs/                # Documentation
```

---

## 🔐 Security Notes

**IMPORTANT:** 
- Never commit `.env` file to version control
- Keep your database passwords secure
- Use environment variables for all sensitive data
- Change default passwords in production

---

## 📚 API Documentation

Full API documentation available in: `API_REFERENCE.md`

**Base URL:** http://localhost:5000

**Endpoints:**
- `/api/restaurants` - Restaurant operations
- `/api/menus` - Menu management
- `/api/orders` - Order processing
- `/api/reviews` - Review system
- `/api/analytics` - Analytics data
- `/api/events` - Event tracking

---

## 📊 Database Schema

### MySQL Tables:
1. `users` - All system users
2. `restaurants` - Restaurant information
3. `delivery_partners` - Delivery partner details
4. `orders` - Order transactions
5. `order_items` - Individual order items
6. `payments` - Payment records

### MongoDB Collections:
1. `menus` - Restaurant menus with items
2. `reviews` - Customer reviews and ratings
3. `order_events` - Order event timeline

Full schema available in: `backend/scripts/schema.sql`

---

## 🎓 For Academic Evaluation

This project demonstrates:
- ✅ 3NF Database Normalization
- ✅ Triggers (Automated order cancellation)
- ✅ Stored Procedures (Partner assignment)
- ✅ Views (Revenue calculations)
- ✅ Transactions (ACID compliance)
- ✅ Aggregation Pipelines (MongoDB)
- ✅ Hybrid Database Architecture
- ✅ RESTful API Design
- ✅ Full-Stack Implementation

---

## 📞 Support

For issues or questions:
1. Check `TROUBLESHOOTING.md`
2. Review error logs in terminal
3. Verify database connections
4. Check API documentation

---

## ✅ Quick Start Checklist

- [ ] Node.js and npm installed
- [ ] MySQL database created
- [ ] MongoDB running (Atlas or local)
- [ ] `.env` file configured with credentials
- [ ] Backend dependencies installed (`npm install`)
- [ ] Frontend dependencies installed (`npm install`)
- [ ] Database schema created (`node scripts/init-database.js`)
- [ ] Sample data seeded (`node scripts/seed.js`)
- [ ] Backend server running on port 5000
- [ ] Frontend running on port 3000
- [ ] Browser opened to http://localhost:3000

---

**Happy Coding! 🚀**
