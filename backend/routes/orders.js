/**
 * Order Routes
 * Defines API endpoints for order operations
 */

const express = require('express');
const router = express.Router();
const OrderController = require('../controllers/orderController');

// GET /api/orders - Get all orders (with filters)
router.get('/', OrderController.getAllOrders);

// GET /api/orders/delivery/available - Get available deliveries
router.get('/delivery/available', OrderController.getAvailableDeliveries);

// GET /api/orders/delivery/partner/:partnerId - Get partner's deliveries
router.get('/delivery/partner/:partnerId', OrderController.getPartnerDeliveries);

// GET /api/orders/restaurant/:restaurantId - Get restaurant orders
router.get('/restaurant/:restaurantId', OrderController.getRestaurantOrders);

// GET /api/orders/user/:userId/stats - Get user statistics
router.get('/user/:userId/stats', OrderController.getUserOrderStats);

// GET /api/orders/:id/items - Get order items (must come before /:id)
router.get('/:id/items', OrderController.getOrderItems);

// GET /api/orders/:id - Get single order
router.get('/:id', OrderController.getOrderById);

// POST /api/orders - Create new order
router.post('/', OrderController.createOrder);

// PUT /api/orders/:id/status - Update order status
router.put('/:id/status', OrderController.updateOrderStatus);

// POST /api/orders/:id/assign-partner - Assign delivery partner
router.post('/:id/assign-partner', OrderController.assignPartner);

// POST /api/orders/:id/accept-delivery - Accept delivery (partner assignment)
router.post('/:id/accept-delivery', OrderController.acceptDelivery);

module.exports = router;
