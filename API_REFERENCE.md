# API Reference - Food Delivery System

Base URL: `http://localhost:5000/api`

## 🏪 Restaurants

### GET /restaurants
Get all restaurants
```javascript
fetch('http://localhost:5000/api/restaurants')
```

### GET /restaurants/:id
Get restaurant by ID
```javascript
fetch('http://localhost:5000/api/restaurants/1')
```

### GET /restaurants/:id/stats
Get restaurant statistics
```javascript
fetch('http://localhost:5000/api/restaurants/1/stats')
```

### POST /restaurants
Create new restaurant
```javascript
fetch('http://localhost:5000/api/restaurants', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    name: "Pizza Palace",
    cuisine_type: "Italian",
    address: "123 Main St",
    phone: "555-0123",
    rating: 4.5
  })
})
```

## 📋 Menus

### GET /menus
Get all menus

### GET /menus/restaurant/:restaurantId
Get menu for specific restaurant
```javascript
fetch('http://localhost:5000/api/menus/restaurant/1')
```

### GET /menus/search?query=pizza
Search menu items
```javascript
fetch('http://localhost:5000/api/menus/search?query=pizza')
```

### GET /menus/popular?limit=10
Get popular items
```javascript
fetch('http://localhost:5000/api/menus/popular?limit=10')
```

### GET /menus/dietary/vegetarian
Get items by dietary preference
```javascript
fetch('http://localhost:5000/api/menus/dietary/vegetarian')
```

## 📦 Orders

### GET /orders
Get all orders with filters
```javascript
fetch('http://localhost:5000/api/orders?user_id=1&status=PLACED')
```

### GET /orders/:id
Get order details
```javascript
fetch('http://localhost:5000/api/orders/1')
```

### POST /orders
Create new order
```javascript
fetch('http://localhost:5000/api/orders', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    user_id: 1,
    restaurant_id: 1,
    items: [
      {item_name: "Margherita Pizza", quantity: 2, price: 12.99},
      {item_name: "Garlic Bread", quantity: 1, price: 4.99}
    ],
    delivery_address: "123 Main St, Apt 4B",
    payment_method: "CARD",
    total_amount: 30.97
  })
})
```

### PUT /orders/:id/status
Update order status
```javascript
fetch('http://localhost:5000/api/orders/1/status', {
  method: 'PUT',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    status: "PREPARING",
    updated_by: "restaurant"
  })
})
```

Valid statuses: `PLACED`, `ACCEPTED`, `REJECTED`, `PREPARING`, `PICKED_UP`, `DELIVERED`, `CANCELLED`

### POST /orders/:id/assign-partner
Assign delivery partner (uses stored procedure)
```javascript
fetch('http://localhost:5000/api/orders/1/assign-partner', {
  method: 'POST'
})
```

### GET /orders/restaurant/:restaurantId
Get orders for restaurant
```javascript
fetch('http://localhost:5000/api/orders/restaurant/1?status=PLACED')
```

### GET /orders/delivery/available
Get available deliveries for partners
```javascript
fetch('http://localhost:5000/api/orders/delivery/available')
```

### GET /orders/user/:userId/stats
Get user order statistics
```javascript
fetch('http://localhost:5000/api/orders/user/1/stats')
```

## ⭐ Reviews

### GET /reviews/restaurant/:restaurantId
Get reviews for restaurant
```javascript
fetch('http://localhost:5000/api/reviews/restaurant/1')
```

### GET /reviews/restaurant/:restaurantId/summary
Get rating summary
```javascript
fetch('http://localhost:5000/api/reviews/restaurant/1/summary')
```

### GET /reviews/top-rated?limit=10
Get top-rated restaurants
```javascript
fetch('http://localhost:5000/api/reviews/top-rated?limit=10')
```

### GET /reviews/recent?limit=20
Get recent reviews
```javascript
fetch('http://localhost:5000/api/reviews/recent?limit=20')
```

### GET /reviews/user/:userId
Get reviews by user
```javascript
fetch('http://localhost:5000/api/reviews/user/1')
```

### POST /reviews
Create review
```javascript
fetch('http://localhost:5000/api/reviews', {
  method: 'POST',
  headers: {'Content-Type': 'application/json'},
  body: JSON.stringify({
    order_id: 1,
    user_id: 1,
    restaurant_id: 1,
    rating: 5,
    comment: "Excellent food!",
    food_rating: 5,
    delivery_rating: 5,
    value_rating: 4
  })
})
```

## 📊 Events

### GET /events/order/:orderId
Get events for order
```javascript
fetch('http://localhost:5000/api/events/order/1')
```

### GET /events/order/:orderId/timeline
Get order timeline
```javascript
fetch('http://localhost:5000/api/events/order/1/timeline')
```

### GET /events/recent?limit=50
Get recent events (activity feed)
```javascript
fetch('http://localhost:5000/api/events/recent?limit=50')
```

### GET /events/analytics/delivery-time
Get delivery time analytics
```javascript
fetch('http://localhost:5000/api/events/analytics/delivery-time')
```

### GET /events/analytics/status-transitions
Get status transition statistics
```javascript
fetch('http://localhost:5000/api/events/analytics/status-transitions')
```

## 📈 Analytics

### GET /analytics/dashboard
Complete analytics dashboard
```javascript
fetch('http://localhost:5000/api/analytics/dashboard')
```

### GET /analytics/restaurant-revenue
Restaurant revenue (from view)
```javascript
fetch('http://localhost:5000/api/analytics/restaurant-revenue')
```

### GET /analytics/top-customers
Top customers (from view)
```javascript
fetch('http://localhost:5000/api/analytics/top-customers')
```

### GET /analytics/active-deliveries
Active deliveries (from view)
```javascript
fetch('http://localhost:5000/api/analytics/active-deliveries')
```

### GET /analytics/orders-by-status
Orders grouped by status
```javascript
fetch('http://localhost:5000/api/analytics/orders-by-status')
```

### GET /analytics/orders-by-time
Orders by time period
```javascript
fetch('http://localhost:5000/api/analytics/orders-by-time?period=daily')
```
Periods: `hourly`, `daily`, `weekly`, `monthly`

### GET /analytics/peak-hours
Peak ordering hours
```javascript
fetch('http://localhost:5000/api/analytics/peak-hours')
```

### GET /analytics/cuisine-popularity
Cuisine popularity
```javascript
fetch('http://localhost:5000/api/analytics/cuisine-popularity')
```

### GET /analytics/partner-performance
Delivery partner performance
```javascript
fetch('http://localhost:5000/api/analytics/partner-performance')
```

### GET /analytics/payment-methods
Payment method distribution
```javascript
fetch('http://localhost:5000/api/analytics/payment-methods')
```

## 🏥 Health Check

### GET /health
Check API and database health
```javascript
fetch('http://localhost:5000/health')
```

## Response Format

### Success Response
```json
{
  "success": true,
  "data": { /* response data */ },
  "count": 10
}
```

### Error Response
```json
{
  "success": false,
  "error": "Error message",
  "message": "Detailed error description"
}
```

## Example React Hook

```javascript
import { useState, useEffect } from 'react';

function useRestaurants() {
  const [restaurants, setRestaurants] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetch('http://localhost:5000/api/restaurants')
      .then(res => res.json())
      .then(data => {
        setRestaurants(data.data || data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, []);

  return { restaurants, loading, error };
}

export default useRestaurants;
```

## CORS
CORS is enabled for all origins in development mode.
