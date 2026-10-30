/**
 * Order Controller
 * Handles HTTP requests for order operations
 */

const OrderModel = require('../models/orderModel');
const eventModel = require('../models/eventModel');

class OrderController {
  /**
   * GET /api/orders
   * Get all orders with optional filters
   */
  static async getAllOrders(req, res) {
    try {
      const filters = {
        user_id: req.query.user_id,
        restaurant_id: req.query.restaurant_id,
        partner_id: req.query.partner_id,
        status: req.query.status,
        limit: req.query.limit
      };
      
      const orders = await OrderModel.getAllOrders(filters);
      
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/:id
   * Get single order with full details
   */
  static async getOrderById(req, res) {
    try {
      const orderId = req.params.id;
      
      const order = await OrderModel.getOrderById(orderId);
      
      if (!order) {
        return res.status(404).json({
          success: false,
          error: 'Order not found'
        });
      }
      
      // Get order items
      const items = await OrderModel.getOrderItems(orderId);
      
      // Get payment info
      const payment = await OrderModel.getOrderPayment(orderId);
      
      res.json({
        success: true,
        data: {
          ...order,
          items,
          payment
        }
      });
    } catch (error) {
      console.error('Error fetching order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/:id/items
   * Get order items only
   */
  static async getOrderItems(req, res) {
    try {
      const orderId = req.params.id;
      
      const items = await OrderModel.getOrderItems(orderId);
      
      res.json({
        success: true,
        count: items.length,
        data: items
      });
    } catch (error) {
      console.error('Error fetching order items:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch order items',
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/orders
   * Create new order (with MySQL transaction)
   */
  static async createOrder(req, res) {
    try {
      const { user_id, restaurant_id, items, delivery_address, payment_method, total_amount } = req.body;
      
      // Validation
      if (!user_id || !restaurant_id || !items || !delivery_address || !payment_method || !total_amount) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields'
        });
      }
      
      if (!Array.isArray(items) || items.length === 0) {
        return res.status(400).json({
          success: false,
          error: 'Items must be a non-empty array'
        });
      }
      
      // Create order with transaction
      const result = await OrderModel.createOrder({
        user_id,
        restaurant_id,
        items,
        delivery_address,
        payment_method,
        total_amount
      });
      
      // Log order creation event to MongoDB
      try {
        await eventModel.logEvent({
          order_id: result.order_id,
          status: 'PLACED',
          by_role: 'customer',
          by_id: user_id,
          timestamp: new Date(),
          note: `Order created for ₹${total_amount} via ${payment_method}`
        });
      } catch (mongoError) {
        console.warn('Failed to log event to MongoDB:', mongoError.message);
        // Don't fail the order creation if event logging fails
      }
      
      res.status(201).json({
        success: true,
        message: 'Order placed successfully',
        data: result
      });
    } catch (error) {
      console.error('Error creating order:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create order',
        message: error.message
      });
    }
  }
  
  /**
   * PUT /api/orders/:id/status
   * Update order status
   */
  static async updateOrderStatus(req, res) {
    try {
      const orderId = req.params.id;
      const { status, updated_by } = req.body;
      
      if (!status) {
        return res.status(400).json({
          success: false,
          error: 'Status is required'
        });
      }
      
      const validStatuses = ['PLACED', 'ACCEPTED', 'REJECTED', 'PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP', 'DELIVERED', 'CANCELLED'];
      if (!validStatuses.includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Invalid status value'
        });
      }
      
      const order = await OrderModel.updateOrderStatus(orderId, status, updated_by);
      
      // Log status change event to MongoDB
      try {
        await eventModel.logEvent({
          order_id: parseInt(orderId),
          status: status,
          by_role: updated_by || 'system',
          timestamp: new Date(),
          note: `Status changed from ${order.previous_status || 'PLACED'} to ${status}`
        });
      } catch (mongoError) {
        console.warn('Failed to log event to MongoDB:', mongoError.message);
        // Don't fail the status update if event logging fails
      }
      
      res.json({
        success: true,
        message: `Order status updated to ${status}`,
        data: order
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update order status',
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/orders/:id/assign-partner
   * Assign delivery partner (uses stored procedure)
   */
  static async assignPartner(req, res) {
    try {
      const orderId = req.params.id;
      
      const result = await OrderModel.assignPartner(orderId);
      
      if (result.result === 'NO_PARTNER_AVAILABLE') {
        return res.status(404).json({
          success: false,
          error: 'No delivery partner available',
          data: result
        });
      }
      
      // Log partner assignment event to MongoDB
      try {
        await eventModel.logEvent({
          order_id: parseInt(orderId),
          status: 'PICKED_UP',
          by_role: 'system',
          timestamp: new Date(),
          note: `Partner assigned: ${result.partner_name || result.partner_id}`
        });
      } catch (mongoError) {
        console.warn('Failed to log event to MongoDB:', mongoError.message);
      }
      
      res.json({
        success: true,
        message: 'Partner assigned successfully',
        data: result
      });
    } catch (error) {
      console.error('Error assigning partner:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to assign partner',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/restaurant/:restaurantId
   * Get orders for a restaurant
   */
  static async getRestaurantOrders(req, res) {
    try {
      const restaurantId = req.params.restaurantId;
      const status = req.query.status;
      
      const orders = await OrderModel.getRestaurantOrders(restaurantId, status);
      
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching restaurant orders:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurant orders',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/delivery/available
   * Get available deliveries for partners
   */
  static async getAvailableDeliveries(req, res) {
    try {
      const orders = await OrderModel.getAvailableDeliveries();
      
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching available deliveries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch available deliveries',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/delivery/partner/:partnerId
   * Get partner's active deliveries
   */
  static async getPartnerDeliveries(req, res) {
    try {
      const partnerId = req.params.partnerId;
      
      const orders = await OrderModel.getPartnerDeliveries(partnerId);
      
      res.json({
        success: true,
        count: orders.length,
        data: orders
      });
    } catch (error) {
      console.error('Error fetching partner deliveries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch partner deliveries',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/orders/user/:userId/stats
   * Get user order statistics
   */
  static async getUserOrderStats(req, res) {
    try {
      const userId = req.params.userId;
      
      const stats = await OrderModel.getUserOrderStats(userId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching user stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch user statistics',
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/orders/:id/accept-delivery
   * Assign delivery partner to order (first-come-first-served)
   */
  static async acceptDelivery(req, res) {
    try {
      const orderId = req.params.id;
      const { partner_id } = req.body;
      
      if (!partner_id) {
        return res.status(400).json({
          success: false,
          error: 'partner_id is required'
        });
      }
      
      const result = await OrderModel.acceptDelivery(orderId, partner_id);
      
      // Log acceptance event to MongoDB
      try {
        await eventModel.logEvent({
          order_id: parseInt(orderId),
          status: 'ACCEPTED_BY_PARTNER',
          by_role: 'partner',
          by_id: partner_id,
          timestamp: new Date(),
          note: `Delivery accepted by partner ${partner_id}`
        });
      } catch (mongoError) {
        console.warn('Failed to log event to MongoDB:', mongoError.message);
      }
      
      res.json({
        success: true,
        message: 'Delivery accepted successfully',
        data: result
      });
    } catch (error) {
      console.error('Error accepting delivery:', error);
      
      // Handle specific error cases
      if (error.message === 'ORDER_ALREADY_ASSIGNED') {
        return res.status(409).json({
          success: false,
          error: 'Order already assigned to another partner',
          message: 'This order has been taken by another delivery partner'
        });
      }
      
      if (error.message === 'Order not found') {
        return res.status(404).json({
          success: false,
          error: 'Order not found',
          message: error.message
        });
      }
      
      res.status(500).json({
        success: false,
        error: 'Failed to accept delivery',
        message: error.message
      });
    }
  }
}

module.exports = OrderController;
