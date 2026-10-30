/**
 * Analytics Routes
 * Defines API endpoints for analytics and reporting
 */

const express = require('express');
const router = express.Router();
const AnalyticsController = require('../controllers/analyticsController');

// GET /api/analytics/dashboard - Overall system statistics
router.get('/dashboard', AnalyticsController.getDashboardStats);

// GET /api/analytics/restaurant-revenue - Restaurant revenue (from MySQL view)
router.get('/restaurant-revenue', AnalyticsController.getRestaurantRevenue);

// GET /api/analytics/top-customers - Top customers by spending
router.get('/top-customers', AnalyticsController.getTopCustomers);

// GET /api/analytics/active-deliveries - Currently active deliveries
router.get('/active-deliveries', AnalyticsController.getActiveDeliveries);

// GET /api/analytics/orders-by-status - Order distribution by status
router.get('/orders-by-status', AnalyticsController.getOrdersByStatus);

// GET /api/analytics/orders-by-time - Orders grouped by time
router.get('/orders-by-time', AnalyticsController.getOrdersByTime);

// GET /api/analytics/peak-hours - Hourly order distribution
router.get('/peak-hours', AnalyticsController.getPeakHours);

// GET /api/analytics/cuisine-popularity - Cuisine type popularity
router.get('/cuisine-popularity', AnalyticsController.getCuisinePopularity);

// GET /api/analytics/partner-performance - Delivery partner metrics
router.get('/partner-performance', AnalyticsController.getPartnerPerformance);

// GET /api/analytics/payment-methods - Payment method distribution
router.get('/payment-methods', AnalyticsController.getPaymentMethods);

module.exports = router;
