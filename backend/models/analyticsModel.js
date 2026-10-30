/**
 * Analytics Model
 * Handles queries for analytics and reporting
 * Uses MySQL views and aggregations
 */

const { getMySQLConnection } = require('../config/database');

class AnalyticsModel {
  /**
   * Get restaurant revenue (from MySQL view)
   */
  static async getRestaurantRevenue(limit = null) {
    const connection = await getMySQLConnection();
    
    let query = 'SELECT * FROM restaurant_revenue';
    
    if (limit) {
      query += ' LIMIT ?';
      const [results] = await connection.query(query, [parseInt(limit)]);
      return results;
    }
    
    const [results] = await connection.query(query);
    return results;
  }
  
  /**
   * Get top customers (from MySQL view)
   */
  static async getTopCustomers(limit = 10) {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(
      'SELECT * FROM top_customers LIMIT ?',
      [parseInt(limit)]
    );
    
    return results;
  }
  
  /**
   * Get active deliveries (from MySQL view)
   */
  static async getActiveDeliveries() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query('SELECT * FROM active_deliveries');
    return results;
  }
  
  /**
   * Get order statistics by status
   */
  static async getOrdersByStatus() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        status,
        COUNT(*) as count,
        SUM(total_amount) as total_value
      FROM orders
      GROUP BY status
      ORDER BY count DESC
    `);
    
    return results;
  }
  
  /**
   * Get orders by time period (today, this week, this month)
   */
  static async getOrdersByTimePeriod() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        DATE(placed_at) as order_date,
        COUNT(*) as order_count,
        SUM(total_amount) as daily_revenue,
        AVG(total_amount) as avg_order_value
      FROM orders
      WHERE placed_at >= DATE_SUB(CURDATE(), INTERVAL 30 DAY)
      GROUP BY DATE(placed_at)
      ORDER BY order_date DESC
    `);
    
    return results;
  }
  
  /**
   * Get hourly order distribution
   */
  static async getOrdersByHour() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        HOUR(placed_at) as hour,
        COUNT(*) as order_count
      FROM orders
      GROUP BY HOUR(placed_at)
      ORDER BY hour ASC
    `);
    
    return results;
  }
  
  /**
   * Get cuisine type popularity
   */
  static async getCuisinePopularity() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        r.cuisine_type,
        COUNT(o.order_id) as order_count,
        SUM(o.total_amount) as total_revenue,
        AVG(o.total_amount) as avg_order_value
      FROM restaurants r
      LEFT JOIN orders o ON r.restaurant_id = o.restaurant_id
      WHERE o.status = 'DELIVERED'
      GROUP BY r.cuisine_type
      ORDER BY order_count DESC
    `);
    
    return results;
  }
  
  /**
   * Get delivery partner performance
   */
  static async getPartnerPerformance() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        dp.partner_id,
        u.name as partner_name,
        dp.vehicle_type,
        COUNT(o.order_id) as deliveries_completed,
        AVG(TIMESTAMPDIFF(MINUTE, o.placed_at, NOW())) as avg_delivery_time
      FROM delivery_partners dp
      JOIN users u ON dp.user_id = u.user_id
      LEFT JOIN orders o ON dp.partner_id = o.partner_id 
        AND o.status = 'DELIVERED'
      GROUP BY dp.partner_id, u.name, dp.vehicle_type
      ORDER BY deliveries_completed DESC
    `);
    
    return results;
  }
  
  /**
   * Get overall system statistics
   */
  static async getSystemStats() {
    const connection = await getMySQLConnection();
    
    // Get counts
    const [userCount] = await connection.query('SELECT COUNT(*) as count FROM users');
    const [restaurantCount] = await connection.query('SELECT COUNT(*) as count FROM restaurants');
    const [orderCount] = await connection.query('SELECT COUNT(*) as count FROM orders');
    const [deliveredCount] = await connection.query("SELECT COUNT(*) as count FROM orders WHERE status = 'DELIVERED'");
    
    // Get revenue
    const [revenue] = await connection.query("SELECT SUM(total_amount) as total FROM orders WHERE status = 'DELIVERED'");
    
    // Get active counts
    const [activeOrders] = await connection.query("SELECT COUNT(*) as count FROM orders WHERE status IN ('PLACED', 'ACCEPTED', 'PREPARING', 'PICKED_UP')");
    const [availablePartners] = await connection.query('SELECT COUNT(*) as count FROM delivery_partners WHERE is_available = TRUE');
    
    return {
      total_users: userCount[0].count,
      total_restaurants: restaurantCount[0].count,
      total_orders: orderCount[0].count,
      delivered_orders: deliveredCount[0].count,
      total_revenue: revenue[0].total || 0,
      active_orders: activeOrders[0].count,
      available_partners: availablePartners[0].count
    };
  }
  
  /**
   * Get payment method distribution
   */
  static async getPaymentMethodStats() {
    const connection = await getMySQLConnection();
    
    const [results] = await connection.query(`
      SELECT 
        method,
        COUNT(*) as transaction_count,
        SUM(amount) as total_amount
      FROM payments
      WHERE status = 'SUCCESS'
      GROUP BY method
      ORDER BY transaction_count DESC
    `);
    
    return results;
  }
}

module.exports = AnalyticsModel;
