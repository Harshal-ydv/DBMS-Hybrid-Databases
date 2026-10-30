# 🚀 Quick Start Guide

## Prerequisites
- Node.js installed
- MySQL running on AWS RDS
- MongoDB running locally
- Both backend dependencies installed

## Start the Application

### Terminal 1: Start Backend Server
```bash
cd backend
node server.js
```
✅ Backend will run on http://localhost:5000

### Terminal 2: Start Frontend React App
```bash
cd frontend
npm start
```
✅ Frontend will run on http://localhost:3000

## Using the Application

### 1. Landing Page
- Open http://localhost:3000
- You'll see 4 role cards

### 2. Select a Role

#### Option A: Customer
- Browse restaurants
- View menus
- Add items to cart
- Place orders
- Track order status in real-time

#### Option B: Restaurant Owner
- View incoming orders
- Accept/Reject orders
- Update order status (Preparing, Ready for Pickup)
- View restaurant statistics

#### Option C: Delivery Partner
- View available deliveries
- Accept delivery requests
- Update delivery status

#### Option D: Admin
- View system-wide analytics
- Monitor all orders
- See top-rated restaurants
- View revenue metrics

## Demo Flow

1. **Start as Customer**
   - Browse restaurants
   - Select "Pizza Paradise" (Restaurant ID: 1)
   - Add items to cart (Margherita Pizza, Garlic Bread)
   - Click "Cart" → "Place Order"
   - Mock payment will process
   - View order in "My Orders" tab

2. **Switch to Restaurant Role**
   - Logout → Select "Restaurant Owner"
   - See the new order with status "PLACED"
   - Click "Mark as ACCEPTED"
   - Click "Mark as PREPARING"
   - Order is now ready for pickup

3. **Switch to Delivery Role**
   - Logout → Select "Delivery Partner"
   - See order in "Available Deliveries"
   - Click "Accept Delivery"
   - Order assigned to you

4. **Back to Customer**
   - Logout → Select "Customer"
   - Go to "My Orders"
   - Click "Track Order"
   - See complete order timeline with all status changes

5. **Check Admin Dashboard**
   - Logout → Select "Admin"
   - View system analytics
   - See order distribution
   - Check top restaurants
   - Monitor revenue

## Features Demonstrated

### Backend (43+ Endpoints)
✅ MySQL
- Restaurants CRUD
- Order management with transactions
- Stored procedures (assign_partner)
- Triggers (cancel_order_on_refund)
- Views (restaurant_revenue, top_customers, active_deliveries)
- Complex analytics queries

✅ MongoDB
- Flexible menu schemas
- Review system with aggregations
- Event timeline tracking
- Real-time status updates

### Frontend
✅ React with Material-UI
- 4 role-based dashboards
- Real-time order tracking
- Restaurant browsing with search
- Shopping cart functionality
- Order timeline visualization
- Analytics charts
- Responsive design

## Database Concepts Covered

### MySQL
- Normalization (3NF)
- Foreign Keys & Constraints
- Triggers
- Views
- Stored Procedures
- Transactions
- Indexes

### MongoDB
- Flexible schemas
- Nested documents
- Aggregation pipelines
- Text search
- Time-series data
- Schema validation

## Troubleshooting

### Backend won't start
- Check MySQL connection in .env file
- Ensure MongoDB is running locally
- Verify port 5000 is free

### Frontend won't start
- Run `npm install` in frontend folder
- Check if port 3000 is available
- Clear npm cache: `npm cache clean --force`

### Orders not showing
- Ensure backend is running
- Check browser console for errors
- Verify API calls in Network tab

## API Documentation
See API_REFERENCE.md for complete API documentation

## Project Structure
```
DBMS mini project/
├── backend/
│   ├── models/          # Database models (MySQL + MongoDB)
│   ├── controllers/     # Business logic
│   ├── routes/          # API endpoints
│   ├── config/          # Database connections
│   ├── scripts/         # Seed data & setup
│   └── server.js        # Express server
└── frontend/
    ├── src/
    │   ├── components/  # Reusable UI components
    │   ├── pages/       # Dashboard pages
    │   ├── api.js       # API client
    │   └── App.js       # Main app component
    └── package.json
```

## Tech Stack
- **Backend**: Node.js, Express
- **Frontend**: React 19, Material-UI
- **Databases**: MySQL (AWS RDS), MongoDB (Local)
- **HTTP Client**: Axios

## Next Steps
- Add authentication
- Implement real payment gateway
- Add real-time notifications
- Deploy to cloud
- Add more analytics charts
- Implement review moderation

Enjoy exploring the Food Delivery System! 🍕🚀
