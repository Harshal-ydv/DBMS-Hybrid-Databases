# ⚠️ IMPORTANT: READ THIS FIRST

## 🔐 Security Notice

**This project does NOT include database credentials for security reasons.**

Before running this project, you MUST:

1. **Create your own `.env` file** in the `backend/` folder
2. **Add your database credentials** (MySQL and MongoDB)
3. **Follow the setup instructions** in `SETUP_INSTRUCTIONS.md`

---

## 🚀 Quick Start

### Step 1: Configure Credentials

1. Navigate to `backend/` folder
2. Copy `.env.example` to `.env`:
   ```bash
   cd backend
   copy .env.example .env   # Windows
   # or
   cp .env.example .env     # Mac/Linux
   ```

3. Edit `.env` file with your database credentials:
   ```env
   MYSQL_HOST=your-database-host
   MYSQL_USER=your-username
   MYSQL_PASSWORD=your-password
   MYSQL_DATABASE=food_delivery
   
   MONGODB_URI=your-mongodb-connection-string
   ```

### Step 2: Install Dependencies
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

### Step 3: Setup Database
```bash
cd backend
node scripts/init-database.js    # Create tables, triggers, views
node scripts/seed.js             # Add sample data
```

### Step 4: Run Application
```bash
# Terminal 1: Backend
cd backend
node server.js

# Terminal 2: Frontend
cd frontend
npm start
```

### Step 5: Access Application
Open browser: **http://localhost:3000**

---

## 📚 Full Documentation

- **Setup Guide:** `SETUP_INSTRUCTIONS.md`
- **API Reference:** `API_REFERENCE.md`
- **Project Report:** `Food_Delivery_System_Project_Report.docx`
- **Database Schema:** `backend/scripts/schema.sql`

---

## 🎓 For Evaluators/Teachers

This is a complete DBMS project demonstrating:
- Hybrid Database Architecture (MySQL + MongoDB)
- Advanced SQL (Triggers, Stored Procedures, Views)
- MongoDB Aggregations
- Full-Stack Implementation (Node.js + React)
- 43+ RESTful API Endpoints
- 4 Role-Based Dashboards

**Note:** Actual database credentials are excluded for security best practices.

---

## 🛠️ System Requirements

- Node.js 18+
- MySQL 8.0+ (AWS RDS or Local)
- MongoDB 6.0+ (Atlas or Local)
- npm (included with Node.js)

---

## ❓ Need Help?

See `SETUP_INSTRUCTIONS.md` for detailed setup guide and troubleshooting.

---

**Project by:** Harshal Yadav  
**Academic Year:** 2026
