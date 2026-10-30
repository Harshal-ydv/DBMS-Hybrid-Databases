# Cloud Database Setup Guide

This guide will walk you through setting up AWS RDS (MySQL) and MongoDB Atlas for the Food Delivery System project.

## Prerequisites

- AWS Account (Free Tier eligible)
- MongoDB Atlas Account (Free)
- Basic understanding of databases
- Your local machine's IP address

---

## Part 1: AWS RDS MySQL Setup

### Step 1: Log into AWS Console

1. Go to [https://aws.amazon.com/console/](https://aws.amazon.com/console/)
2. Sign in with your AWS account credentials
3. Make sure you're in a region close to you (check top-right corner)
   - Recommended: `us-east-1`, `ap-south-1` (Mumbai), or `ap-southeast-1` (Singapore)

### Step 2: Navigate to RDS

1. In the AWS Console search bar, type "RDS"
2. Click on "RDS" (Relational Database Service)
3. Click on "Create database" button

### Step 3: Choose Database Configuration

1. **Database creation method**: Choose **Standard create**

2. **Engine options**:
   - Select **MySQL**
   - Version: MySQL 8.0.x (latest)

3. **Templates**:
   - Select **Free tier** ✅ (This is important to avoid charges!)

4. **Settings**:
   - **DB instance identifier**: `food-delivery-db` (or any name you prefer)
   - **Master username**: `admin` (you can change this)
   - **Master password**: Create a strong password
   - **Confirm password**: Re-enter the same password
   - ⚠️ **IMPORTANT**: Save these credentials! You'll need them later

### Step 4: Instance Configuration

1. **DB instance class**:
   - Already selected as `db.t2.micro` or `db.t3.micro` (Free tier eligible)
   - Leave as default

2. **Storage**:
   - **Storage type**: General Purpose SSD (gp2)
   - **Allocated storage**: 20 GiB (Free tier allows up to 20 GB)
   - **Storage autoscaling**: Uncheck this to avoid unexpected charges

### Step 5: Connectivity

1. **Compute resource**: Don't connect to an EC2 compute resource

2. **VPC**: Keep default VPC

3. **Public access**: **YES** ✅
   - This allows you to connect from your local machine
   - ⚠️ For production, you'd use private access with VPN

4. **VPC security group**:
   - Select "Create new"
   - Name: `food-delivery-sg`

5. **Availability Zone**: No preference

6. **Database port**: `3306` (default MySQL port)

### Step 6: Database Authentication

1. **Database authentication**: Password authentication
2. Leave other options as default

### Step 7: Additional Configuration

1. **Initial database name**: `food_delivery` ✅ (Important!)
   - This creates the database automatically

2. **Backup**:
   - Uncheck "Enable automated backups" (for development only)

3. **Encryption**:
   - Leave default (disabled for free tier)

4. **Monitoring**:
   - Uncheck "Enable Enhanced monitoring" (to avoid charges)

5. **Maintenance**:
   - Leave default settings

### Step 8: Create Database

1. Review your settings
2. Click **"Create database"**
3. Wait 5-10 minutes for database to be created
4. You'll see status change from "Creating" → "Available"

### Step 9: Configure Security Group

This is CRITICAL - without this, you can't connect!

1. Click on your database instance name
2. Scroll down to **"Security group rules"**
3. Click on the security group link (e.g., `food-delivery-sg`)
4. Click on the security group ID
5. Go to **"Inbound rules"** tab
6. Click **"Edit inbound rules"**
7. Click **"Add rule"**
   - **Type**: MySQL/Aurora
   - **Protocol**: TCP
   - **Port range**: 3306
   - **Source**: My IP (it will auto-detect your IP)
     - Alternative: For testing, you can use `0.0.0.0/0` (⚠️ Not recommended for production!)
8. Click **"Save rules"**

### Step 10: Get Connection Details

1. Go back to RDS → Databases
2. Click on your database instance
3. Under **"Connectivity & security"**, find:
   - **Endpoint**: Something like `food-delivery-db.xxxxx.us-east-1.rds.amazonaws.com`
   - **Port**: 3306
   - Copy the endpoint URL

### Step 11: Test Connection

You can test using MySQL Workbench:

1. Download MySQL Workbench from [https://dev.mysql.com/downloads/workbench/](https://dev.mysql.com/downloads/workbench/)
2. Open MySQL Workbench
3. Click "+" to add a new connection
4. Fill in:
   - **Connection Name**: Food Delivery AWS
   - **Hostname**: Your RDS endpoint
   - **Port**: 3306
   - **Username**: admin (or what you set)
   - **Password**: Click "Store in Vault" and enter your password
5. Click "Test Connection"
6. If successful, click "OK"

### Your AWS RDS Credentials

Save these in your `.env` file:

```env
MYSQL_HOST=food-delivery-db.xxxxx.us-east-1.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_password_here
MYSQL_DATABASE=food_delivery
```

### ⚠️ Cost Management Tips

1. **Set up billing alerts**:
   - Go to AWS Billing Dashboard
   - Create an alert for $5 or $10
   - You'll get an email if charges exceed this

2. **Stop the instance when not using**:
   - RDS → Databases → Select your database
   - Actions → Stop temporarily (stops for 7 days)
   - Start it again when needed

3. **Delete when project is complete**:
   - Take a backup first!
   - Actions → Delete
   - Uncheck "Create final snapshot" (for dev only)
   - Type "delete me" to confirm

---

## Part 2: MongoDB Atlas Setup

### Step 1: Create MongoDB Atlas Account

1. Go to [https://www.mongodb.com/cloud/atlas/register](https://www.mongodb.com/cloud/atlas/register)
2. Sign up with email or Google account
3. Verify your email address
4. Log into Atlas

### Step 2: Create a New Cluster

1. Click **"Build a Database"** or **"Create"** button

2. **Choose deployment option**:
   - Select **"M0" (FREE tier)** ✅
   - This gives you 512MB storage for free

3. **Cloud Provider & Region**:
   - **Provider**: AWS (to match your RDS)
   - **Region**: Choose same region as your RDS if possible
     - Example: Mumbai (ap-south-1), Singapore (ap-southeast-1)
   - Free tier regions are marked with "FREE TIER AVAILABLE"

4. **Cluster Name**:
   - Name it `FoodDeliveryCluster` or `Cluster0` (default)

5. Click **"Create"**

6. Wait 3-5 minutes for cluster creation

### Step 3: Create Database User

1. You'll see a **"Security Quickstart"** screen
2. Under **"How would you like to authenticate your connection?"**:
   - Choose **"Username and Password"**
   - **Username**: `fooddelivery_user` (or any name)
   - **Password**: Either auto-generate or create a strong password
   - ⚠️ **Save these credentials!**
   - Click **"Create User"**

### Step 4: Set Up Network Access

1. Still on the Security Quickstart screen
2. Under **"Where would you like to connect from?"**:
   - Choose **"My Local Environment"**
   - Click **"Add My Current IP Address"**
   - Description: "My Development Machine"
   
3. **Alternative (for testing only)**:
   - Click "Add IP Address"
   - Enter `0.0.0.0/0` (allows access from anywhere)
   - Description: "Allow All (Testing Only)"
   - ⚠️ **Not recommended for production!**

4. Click **"Finish and Close"**
5. Click **"Go to Database"**

### Step 5: Get Connection String

1. On the Database Deployments page, click **"Connect"** button (on your cluster)

2. Choose **"Connect your application"**

3. **Driver**: Node.js
4. **Version**: 5.5 or later

5. Copy the connection string:
   ```
   mongodb+srv://fooddelivery_user:<password>@cluster0.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

6. **Replace** `<password>` with your actual password

7. **Add** `/food_delivery` before the `?` to specify the database:
   ```
   mongodb+srv://fooddelivery_user:your_password@cluster0.xxxxx.mongodb.net/food_delivery?retryWrites=true&w=majority
   ```

### Step 6: Test Connection

You can test using MongoDB Compass:

1. Download MongoDB Compass from [https://www.mongodb.com/try/download/compass](https://www.mongodb.com/try/download/compass)
2. Open MongoDB Compass
3. Paste your connection string
4. Click "Connect"
5. If successful, you'll see your databases

### Your MongoDB Credentials

Save in your `.env` file:

```env
MONGODB_URI=mongodb+srv://fooddelivery_user:your_password@cluster0.xxxxx.mongodb.net/food_delivery?retryWrites=true&w=majority
```

### Additional Atlas Tips

1. **View Collections**:
   - Go to Atlas Dashboard
   - Click "Browse Collections"
   - After running seed script, you'll see: menus, order_events, reviews

2. **Monitor Usage**:
   - Atlas Dashboard shows storage usage
   - Free tier: 512MB storage
   - You'll get warnings before hitting limits

3. **Manage Access**:
   - Database Access: Add/remove users
   - Network Access: Add/remove IP addresses

---

## Part 3: Setup Your Project

### Step 1: Create .env File

In your `backend` folder, create a `.env` file:

```env
# MySQL Configuration (AWS RDS)
MYSQL_HOST=your-rds-endpoint.rds.amazonaws.com
MYSQL_PORT=3306
MYSQL_USER=admin
MYSQL_PASSWORD=your_mysql_password
MYSQL_DATABASE=food_delivery

# MongoDB Configuration (Atlas)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/food_delivery?retryWrites=true&w=majority

# Server Configuration
PORT=5000
NODE_ENV=development
```

⚠️ **NEVER commit .env file to Git!** (It's already in .gitignore)

### Step 2: Initialize MySQL Schema

```bash
cd backend
node scripts/schema.sql
```

Or use MySQL Workbench:
1. Connect to your RDS instance
2. File → Open SQL Script
3. Select `backend/scripts/schema.sql`
4. Click the lightning bolt icon to execute

### Step 3: Setup MongoDB Collections

```bash
cd backend
node scripts/mongodb-setup.js
```

### Step 4: Seed the Databases

```bash
cd backend
node scripts/seed.js
```

You should see:
```
✅ MySQL connected
✅ MongoDB connected
✅ Database seeding complete!
```

### Step 5: Start the Backend Server

```bash
cd backend
npm start
```

Visit: `http://localhost:5000/health`

You should see:
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

## Troubleshooting

### Cannot Connect to MySQL RDS

1. **Check Security Group**:
   - Make sure port 3306 is open
   - Source should be your IP or 0.0.0.0/0

2. **Check Public Access**:
   - RDS instance should have "Publicly accessible: Yes"

3. **Check Endpoint**:
   - Make sure you copied the full endpoint with the region

4. **Check Credentials**:
   - Username and password must match what you set

5. **Test with MySQL Workbench**:
   - If Workbench can't connect, the issue is with AWS setup
   - If Workbench connects but Node.js can't, check your .env file

### Cannot Connect to MongoDB Atlas

1. **Check IP Whitelist**:
   - Network Access → Add your current IP
   - Or temporarily use 0.0.0.0/0

2. **Check Connection String**:
   - Must include database name: `/food_delivery`
   - Password must not have special characters that need URL encoding
   - If password has special chars, use `encodeURIComponent(password)`

3. **Check User Permissions**:
   - Database Access → Make sure user has "Read and write to any database"

4. **Test with MongoDB Compass**:
   - If Compass can't connect, the issue is with Atlas setup
   - If Compass connects but Node.js can't, check your connection string

### Schema Script Fails

1. **Delimiter Issues**:
   - If running from command line, you might need to run it section by section
   - Use MySQL Workbench instead - it handles delimiters better

2. **Database Doesn't Exist**:
   - Make sure you specified initial database name when creating RDS
   - Or create it manually: `CREATE DATABASE food_delivery;`

### Seed Script Fails

1. **Foreign Key Violations**:
   - Run `SET FOREIGN_KEY_CHECKS = 0;` before truncating tables
   - The seed script already does this

2. **ObjectId References**:
   - Make sure MongoDB menus are created first
   - Then MySQL orders can reference menu_item_id

---

## Security Best Practices

1. **Never commit .env files**
2. **Use strong passwords** for both databases
3. **Restrict IP access** to only your IP in production
4. **Delete RDS instance** when done with the project
5. **Monitor AWS billing** regularly
6. **Use environment variables** for all sensitive data

---

## Next Steps

Once both databases are set up and seeded:

1. ✅ Test the backend health endpoint
2. ✅ Verify data in MySQL Workbench
3. ✅ Verify data in MongoDB Compass
4. ✅ Proceed to build the API endpoints (Task 5)

---

## Quick Reference

### Useful MySQL Commands

```sql
-- Show all databases
SHOW DATABASES;

-- Use the food_delivery database
USE food_delivery;

-- Show all tables
SHOW TABLES;

-- Describe table structure
DESCRIBE users;

-- Count records
SELECT COUNT(*) FROM orders;

-- Test the trigger
UPDATE payments SET status = 'REFUNDED' WHERE order_id = 1;
SELECT status FROM orders WHERE order_id = 1;  -- Should be CANCELLED

-- Test the view
SELECT * FROM restaurant_revenue;

-- Test stored procedure
CALL assign_partner(5);
```

### Useful MongoDB Commands (in Compass or Shell)

```javascript
// Switch to database
use food_delivery

// Show all collections
show collections

// Count documents
db.menus.countDocuments()
db.order_events.countDocuments()
db.reviews.countDocuments()

// Find sample documents
db.menus.findOne()
db.order_events.find({ order_id: 1 })
db.reviews.find()

// Test index usage
db.order_events.find({ order_id: 1 }).explain("executionStats")

// Aggregation: Average rating per restaurant
db.reviews.aggregate([
  { $group: { _id: "$restaurant_id", avg_rating: { $avg: "$restaurant_rating" } } }
])
```

---

Happy Coding! 🚀
