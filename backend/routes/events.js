const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');

// Get recent events (activity feed)
router.get('/recent', eventController.getRecentEvents);

// Get events by date range
router.get('/date-range', eventController.getEventsByDateRange);

// Get delivery time analytics
router.get('/analytics/delivery-time', eventController.getDeliveryTimeAnalytics);

// Get status transition stats
router.get('/analytics/status-transitions', eventController.getStatusTransitionStats);

// Get events for specific order
router.get('/order/:orderId', eventController.getOrderEvents);

// Get order timeline
router.get('/order/:orderId/timeline', eventController.getOrderTimeline);

// Log new event
router.post('/', eventController.logEvent);

module.exports = router;
