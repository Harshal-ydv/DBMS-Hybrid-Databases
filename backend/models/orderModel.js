/**
 * Order Model
 * Handles MySQL queries for order data with transactions
 */

const { getMySQLConnection } = require('../config/database');

class OrderModel {
  /**
   * Get all orders with optional filters
   */
  static async getAllOrders(filters = {}) {
    const connection = await getMySQLConnection();
    
    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        r.name as restaurant_name,
        r.city as restaurant_city,
        dp.partner_id,
        du.name as partner_name
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN delivery_partners dp ON o.partner_id = dp.partner_id
      LEFT JOIN users du ON dp.user_id = du.user_id
      WHERE 1=1
    `;
    const params = [];
    
    if (filters.user_id) {
      query += ' AND o.user_id = ?';
      params.push(filters.user_id);
    }
    
    if (filters.restaurant_id) {
      query += ' AND o.restaurant_id = ?';
      params.push(filters.restaurant_id);
    }
    
    if (filters.partner_id) {
      query += ' AND o.partner_id = ?';
      params.push(filters.partner_id);
    }
    
    if (filters.status) {
      query += ' AND o.status = ?';
      params.push(filters.status);
    }
    
    query += ' ORDER BY o.placed_at DESC';
    
    if (filters.limit) {
      query += ' LIMIT ?';
      params.push(parseInt(filters.limit));
    }
    
    const [orders] = await connection.query(query, params);
    return orders;
  }
  
  /**
   * Get order by ID with full details
   */
  static async getOrderById(orderId) {
    const connection = await getMySQLConnection();
    
    const [orders] = await connection.query(`
      SELECT 
        o.*,
        u.name as customer_name,
        u.email as customer_email,
        u.phone as customer_phone,
        r.name as restaurant_name,
        r.address as restaurant_address,
        dp.partner_id,
        du.name as partner_name,
        du.phone as partner_phone,
        dp.vehicle_type
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      LEFT JOIN delivery_partners dp ON o.partner_id = dp.partner_id
      LEFT JOIN users du ON dp.user_id = du.user_id
      WHERE o.order_id = ?
    `, [orderId]);
    
    return orders[0] || null;
  }
  
  /**
   * Get order items for an order
   */
  static async getOrderItems(orderId) {
    const connection = await getMySQLConnection();
    
    const [items] = await connection.query(
      'SELECT * FROM order_items WHERE order_id = ?',
      [orderId]
    );
    
    return items;
  }
  
  /**
   * Get payment info for an order
   */
  static async getOrderPayment(orderId) {
    const connection = await getMySQLConnection();
    
    const [payments] = await connection.query(
      'SELECT * FROM payments WHERE order_id = ?',
      [orderId]
    );
    
    return payments[0] || null;
  }
  
  /**
   * Create new order with transaction (ACID compliance)
   */
  static async createOrder(orderData) {
    const pool = await getMySQLConnection();
    const connection = await pool.getConnection();
    
    try {
      // Begin transaction
      await connection.beginTransaction();
      
      // 1. Insert order
      const [orderResult] = await connection.query(
        'INSERT INTO orders (user_id, restaurant_id, total_amount, status, delivery_address) VALUES (?, ?, ?, ?, ?)',
        [
          orderData.user_id,
          orderData.restaurant_id,
          orderData.total_amount,
          'PLACED',
          orderData.delivery_address
        ]
      );
      
      const orderId = orderResult.insertId;
      
      // 2. Insert order items
      for (const item of orderData.items) {
        await connection.query(
          'INSERT INTO order_items (order_id, menu_item_id, item_name, unit_price, quantity, customizations) VALUES (?, ?, ?, ?, ?, ?)',
          [
            orderId,
            item.menu_item_id || null,  // Allow null if not provided
            item.item_name || item.name,  // Support both item_name and name
            item.unit_price || item.price,  // Support both unit_price and price
            item.quantity || 1,
            item.customizations ? JSON.stringify(item.customizations) : null
          ]
        );
      }
      
      // 3. Insert payment
      await connection.query(
        'INSERT INTO payments (order_id, amount, method, status) VALUES (?, ?, ?, ?)',
        [
          orderId,
          orderData.total_amount,
          orderData.payment_method,
          'SUCCESS'
        ]
      );
      
      // Commit transaction
      await connection.commit();
      
      console.log(`✅ Order ${orderId} created successfully with transaction`);
      
      return {
        order_id: orderId,
        status: 'PLACED',
        message: 'Order placed successfully'
      };
      
    } catch (error) {
      // Rollback on error
      await connection.rollback();
      console.error('❌ Transaction rolled back:', error.message);
      throw new Error('Failed to create order: ' + error.message);
    } finally {
      // Release connection back to pool
      connection.release();
    }
  }
  
  /**
   * Update order status
   */
  static async updateOrderStatus(orderId, newStatus, updatedBy = null) {
    const connection = await getMySQLConnection();
    
    const [result] = await connection.query(
      'UPDATE orders SET status = ? WHERE order_id = ?',
      [newStatus, orderId]
    );
    
    if (result.affectedRows === 0) {
      throw new Error('Order not found');
    }
    
    console.log(`✅ Order ${orderId} status updated to ${newStatus}`);
    
    return this.getOrderById(orderId);
  }
  
  /**
   * Assign partner to order (uses stored procedure)
   */
  static async assignPartner(orderId) {
    const connection = await getMySQLConnection();
    
    try {
      const [results] = await connection.query('CALL assign_partner(?)', [orderId]);
      
      // Results from stored procedure
      const result = results[0][0];
      
      return result;
    } catch (error) {
      throw new Error('Failed to assign partner: ' + error.message);
    }
  }
  
  /**
   * Get order statistics for a user
   */
  static async getUserOrderStats(userId) {
    const connection = await getMySQLConnection();
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(*) as total_orders,
        COUNT(CASE WHEN status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COUNT(CASE WHEN status = 'CANCELLED' THEN 1 END) as cancelled_orders,
        COALESCE(SUM(CASE WHEN status = 'DELIVERED' THEN total_amount END), 0) as total_spent
      FROM orders
      WHERE user_id = ?
    `, [userId]);
    
    return stats[0];
  }
  
  /**
   * Get orders for restaurant owner
   */
  static async getRestaurantOrders(restaurantId, status = null) {
    const connection = await getMySQLConnection();
    
    let query = `
      SELECT 
        o.*,
        u.name as customer_name,
        u.phone as customer_phone
      FROM orders o
      JOIN users u ON o.user_id = u.user_id
      WHERE o.restaurant_id = ?
    `;
    const params = [restaurantId];
    
    if (status) {
      query += ' AND o.status = ?';
      params.push(status);
    }
    
    query += ' ORDER BY o.placed_at DESC';
    
    const [orders] = await connection.query(query, params);
    return orders;
  }
  
  /**
   * Get available orders for delivery partners
   */
  static async getAvailableDeliveries() {
    const connection = await getMySQLConnection();
    
    const [orders] = await connection.query(`
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        u.name as customer_name,
        u.phone as customer_phone
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.status IN ('PREPARING', 'READY_FOR_PICKUP') AND o.partner_id IS NULL
      ORDER BY o.placed_at ASC
    `);
    
    return orders;
  }
  
  /**
   * Get partner's active and recently completed deliveries
   * Includes: active deliveries + deliveries completed in last 24 hours
   */
  static async getPartnerDeliveries(partnerId) {
    const connection = await getMySQLConnection();
    
    const [orders] = await connection.query(`
      SELECT 
        o.*,
        r.name as restaurant_name,
        r.address as restaurant_address,
        u.name as customer_name,
        u.phone as customer_phone
      FROM orders o
      JOIN restaurants r ON o.restaurant_id = r.restaurant_id
      JOIN users u ON o.user_id = u.user_id
      WHERE o.partner_id = ? 
        AND (
          o.status IN ('PREPARING', 'READY_FOR_PICKUP', 'PICKED_UP')
          OR (o.status = 'DELIVERED' AND o.placed_at >= DATE_SUB(NOW(), INTERVAL 1 DAY))
        )
      ORDER BY o.placed_at DESC
    `, [partnerId]);
    
    return orders;
  }
  
  /**
   * Accept delivery - assign partner to order without changing status
   * Implements first-come-first-served using transaction
   */
  static async acceptDelivery(orderId, partnerId) {
    const pool = await getMySQLConnection();
    const connection = await pool.getConnection();
    
    try {
      await connection.beginTransaction();
      
      // Check if order exists and is available
      const [orders] = await connection.query(
        'SELECT order_id, status, partner_id FROM orders WHERE order_id = ? FOR UPDATE',
        [orderId]
      );
      
      if (orders.length === 0) {
        throw new Error('Order not found');
      }
      
      const order = orders[0];
      
      // Check if already assigned
      if (order.partner_id !== null) {
        throw new Error('ORDER_ALREADY_ASSIGNED');
      }
      
      // Check if order is in acceptable status
      if (!['PREPARING', 'READY_FOR_PICKUP'].includes(order.status)) {
        throw new Error('Order is not available for delivery');
      }
      
      // Assign partner
      await connection.query(
        'UPDATE orders SET partner_id = ? WHERE order_id = ?',
        [partnerId, orderId]
      );
      
      await connection.commit();
      
      console.log(`✅ Order ${orderId} accepted by partner ${partnerId}`);
      
      return {
        order_id: orderId,
        partner_id: partnerId,
        message: 'Delivery accepted successfully'
      };
      
    } catch (error) {
      await connection.rollback();
      console.error('❌ Accept delivery failed:', error.message);
      throw error;
    } finally {
      connection.release();
    }
  }
}

module.exports = OrderModel;
