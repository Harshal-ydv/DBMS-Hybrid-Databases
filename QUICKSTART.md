# 🚀 Quick Start Guide

Get your Food Delivery System up and running in under 30 minutes!

---

## Prerequisites

Before you start, make sure you have:

- ✅ Node.js installed (v18+): `node --version`
- ✅ npm installed: `npm --version`
- ✅ AWS account (free tier)
- ✅ MongoDB Atlas account (free)

---

## Step 1: Set Up Cloud Databases (15 minutes)

### AWS RDS MySQL

1. Go to [AWS Console](https://aws.amazon.com/console/) → RDS → Create Database
2. Choose: **MySQL 8.0**, **Free Tier** template
3. Settings:
   - DB identifier: `food-delivery-db`
   - Username: `admin`
   - Password: [create a strong password]
4. **Important**: Set "Public access" to **YES**
5. Create database (wait 5-10 min)
6. Configure Security Group:
   - Go to your database → Security → Edit inbound rules
   - Add rule: **MySQL/Aurora**, Port **3306**, Source: **My IP**
7. Copy the **Endpoint** URL

### MongoDB Atlas

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas/register) → Create M0 Free Cluster
2. Choose **AWS** provider, same region as your RDS
3. Create Database User:
   - Username: `fooddelivery_user`
   - Password: [create a strong password]
4. Network Access → Add IP Address → **Add Current IP**
5. Connect → Connect your application → Copy connection string
6. Edit string: Add `/food_delivery` before the `?`

---

## Step 2: Configure Project (2 minutes)

```bash
# Navigate to your project
cd "DBMS mini project\backend"

# Install dependencies
npm install

# Create .env file
copy .env.example .env
```

Now edit `.env` with your credentials:

```env
MYSQL_HOST=your-rds-endpoint.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=food_delivery

MONGODB_URI=mongodb+srv://fooddelivery_user:your_mongo_password@cluster0.xxxxx.mongodb.net/food_delivery?retryWrites=true&w=majority

PORT=5000
NODE_ENV=development
```

---

## Step 3: Test Connections (1 minute)

```bash
node test-connection.js
```

✅ You should see:
```
✅ MySQL connected successfully!
✅ MongoDB connected successfully!
```

❌ If errors, check:
- `.env` file is in `backend` folder
- AWS security group allows port 3306
- MongoDB Atlas has your IP whitelisted
- Connection strings are correct

---

## Step 4: Initialize Databases (5 minutes)

### MySQL Schema

**Option A: MySQL Workbench (Recommended)**
1. Open MySQL Workbench
2. Connect to your RDS instance
3. File → Open SQL Script → Select `backend/scripts/schema.sql`
4. Click Execute (⚡)

**Option B: Command Line**
```bash
mysql -h your-endpoint.rds.amazonaws.com -u admin -p food_delivery < scripts/schema.sql
```

### MongoDB Collections

```bash
node scripts/mongodb-setup.js
```

Expected output:
```
✅ menus collection created with validation
✅ order_events collection created with validation
✅ reviews collection created with validation
```

---

## Step 5: Seed Sample Data (2 minutes)

```bash
node scripts/seed.js
```

Expected output:
```
✅ MySQL connected
✅ MongoDB connected
✅ 10 users created
✅ 5 restaurants created
✅ 5 restaurant menus created
✅ 7 orders created
✅ 24 order events created
✅ 3 reviews created
✅ Database seeding complete!
```

---

## Step 6: Start the Server (1 minute)

```bash
npm start
```

Expected output:
```
✅ MySQL connected successfully
✅ MongoDB connected successfully
✅ Server running on port 5000
🌐 API URL: http://localhost:5000
```

---

## Step 7: Verify Everything Works

Open your browser and visit:

**Health Check**: http://localhost:5000/health

Should return:
```json
{
  "status": "healthy",
  "databases": {
    "mysql": "connected",
    "mongodb": "connected"
  }
}
```

---

## 🎉 Success!

You now have:

✅ AWS RDS MySQL with 6 tables, triggers, views, and stored procedures  
✅ MongoDB Atlas with 3 collections and indexes  
✅ 10 users, 5 restaurants, 7 orders, 25+ menu items seeded  
✅ Backend server running and connected to both databases  

---

## Next Steps

Now you can proceed with Phase 2: Backend API Development

1. Build restaurant and menu APIs
2. Implement order placement with transactions
3. Create status management endpoints
4. Add review system
5. Build analytics APIs

Refer to `IMPLEMENTATION_PLAN.md` for detailed task breakdown.

---

## Verify Your Data

### MySQL (using MySQL Workbench)

```sql
USE food_delivery;

-- Check users
SELECT * FROM users;

-- Check restaurants
SELECT * FROM restaurants;

-- Check orders in different states
SELECT order_id, status, total_amount FROM orders;

-- Test the view
SELECT * FROM restaurant_revenue;

-- Test stored procedure
CALL assign_partner(5);

-- Test trigger
UPDATE payments SET status = 'REFUNDED' WHERE order_id = 1;
SELECT status FROM orders WHERE order_id = 1;  -- Should be CANCELLED
```

### MongoDB (using MongoDB Compass or Shell)

```javascript
// Connect to your cluster in Compass
// Or use mongosh with your connection string

// Check menus
db.menus.countDocuments()  // Should be 5
db.menus.findOne({ restaurant_id: 1 })

// Check order events
db.order_events.countDocuments()  // Should be 24+
db.order_events.find({ order_id: 1 }).sort({ timestamp: 1 })

// Check reviews
db.reviews.find()

// Test aggregation - average ratings
db.reviews.aggregate([
  { $group: { _id: "$restaurant_id", avg: { $avg: "$restaurant_rating" } } }
])

// Test aggregation - peak hours
db.order_events.aggregate([
  { $match: { status: "PLACED" } },
  { $project: { hour: { $hour: "$timestamp" } } },
  { $group: { _id: "$hour", count: { $sum: 1 } } },
  { $sort: { count: -1 } }
])
```

---

## Troubleshooting

### "Cannot connect to MySQL"
- Check AWS RDS security group
- Verify public access is enabled
- Confirm endpoint URL is correct

### "Cannot connect to MongoDB"
- Check Network Access in Atlas
- Verify password has no special characters (or URL encode it)
- Confirm cluster is running

### "Schema script fails"
- Use MySQL Workbench instead of command line
- Make sure database `food_delivery` exists

### "Seed script fails"
- Ensure schema.sql was executed successfully
- Run mongodb-setup.js before seed.js

### "npm install fails"
- Check Node.js version: `node --version` (need v18+)
- Try: `npm cache clean --force` then `npm install`

---

## Important Notes

⚠️ **For Development Only**:
- Public database access
- 0.0.0.0/0 IP whitelist
- No encryption

⚠️ **Cost Management**:
- Set AWS billing alerts
- Stop RDS when not using
- Delete resources after project completion

⚠️ **Never Commit**:
- .env file (contains credentials)
- node_modules folder

---

## Helpful Resources

- **Detailed Cloud Setup**: `docs/CLOUD_SETUP_GUIDE.md`
- **Full Documentation**: `README.md`
- **Implementation Plan**: `IMPLEMENTATION_PLAN.md`
- **Progress Tracking**: `PROGRESS.md`

---

## Support

If you get stuck:
1. Check the error message
2. Review Troubleshooting section in README.md
3. Verify .env file format
4. Check docs/CLOUD_SETUP_GUIDE.md
5. Run test-connection.js to isolate the issue

---

**Estimated Total Time**: 25-30 minutes  
**Difficulty**: Beginner-friendly with detailed guides

Good luck with your DBMS project! 🚀
