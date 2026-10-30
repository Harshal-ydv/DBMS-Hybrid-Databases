/**
 * Restaurant Model
 * Handles MySQL queries for restaurant data
 */

const { getMySQLConnection } = require('../config/database');

class RestaurantModel {
  /**
   * Get all restaurants
   * Optionally filter by city or cuisine
   */
  static async getAllRestaurants(filters = {}) {
    const connection = await getMySQLConnection();
    
    let query = 'SELECT * FROM restaurants WHERE 1=1';
    const params = [];
    
    if (filters.city) {
      query += ' AND city = ?';
      params.push(filters.city);
    }
    
    if (filters.cuisine_type) {
      query += ' AND cuisine_type = ?';
      params.push(filters.cuisine_type);
    }
    
    if (filters.is_open !== undefined) {
      query += ' AND is_open = ?';
      params.push(filters.is_open);
    }
    
    query += ' ORDER BY name ASC';
    
    const [restaurants] = await connection.query(query, params);
    return restaurants;
  }
  
  /**
   * Get restaurant by ID
   */
  static async getRestaurantById(restaurantId) {
    const connection = await getMySQLConnection();
    
    const [restaurants] = await connection.query(
      'SELECT * FROM restaurants WHERE restaurant_id = ?',
      [restaurantId]
    );
    
    return restaurants[0] || null;
  }
  
  /**
   * Get restaurant with owner details
   */
  static async getRestaurantWithOwner(restaurantId) {
    const connection = await getMySQLConnection();
    
    const [restaurants] = await connection.query(`
      SELECT 
        r.*,
        u.name as owner_name,
        u.email as owner_email,
        u.phone as owner_phone
      FROM restaurants r
      JOIN users u ON r.owner_id = u.user_id
      WHERE r.restaurant_id = ?
    `, [restaurantId]);
    
    return restaurants[0] || null;
  }
  
  /**
   * Get restaurants by owner
   */
  static async getRestaurantsByOwner(ownerId) {
    const connection = await getMySQLConnection();
    
    const [restaurants] = await connection.query(
      'SELECT * FROM restaurants WHERE owner_id = ? ORDER BY name ASC',
      [ownerId]
    );
    
    return restaurants;
  }
  
  /**
   * Create new restaurant
   */
  static async createRestaurant(restaurantData) {
    const connection = await getMySQLConnection();
    
    const [result] = await connection.query(
      'INSERT INTO restaurants (owner_id, name, city, address, cuisine_type, is_open) VALUES (?, ?, ?, ?, ?, ?)',
      [
        restaurantData.owner_id,
        restaurantData.name,
        restaurantData.city,
        restaurantData.address,
        restaurantData.cuisine_type,
        restaurantData.is_open !== undefined ? restaurantData.is_open : true
      ]
    );
    
    return {
      restaurant_id: result.insertId,
      ...restaurantData
    };
  }
  
  /**
   * Update restaurant
   */
  static async updateRestaurant(restaurantId, updates) {
    const connection = await getMySQLConnection();
    
    const fields = [];
    const values = [];
    
    if (updates.name !== undefined) {
      fields.push('name = ?');
      values.push(updates.name);
    }
    if (updates.city !== undefined) {
      fields.push('city = ?');
      values.push(updates.city);
    }
    if (updates.address !== undefined) {
      fields.push('address = ?');
      values.push(updates.address);
    }
    if (updates.cuisine_type !== undefined) {
      fields.push('cuisine_type = ?');
      values.push(updates.cuisine_type);
    }
    if (updates.is_open !== undefined) {
      fields.push('is_open = ?');
      values.push(updates.is_open);
    }
    
    if (fields.length === 0) {
      throw new Error('No fields to update');
    }
    
    values.push(restaurantId);
    
    const query = `UPDATE restaurants SET ${fields.join(', ')} WHERE restaurant_id = ?`;
    
    await connection.query(query, values);
    
    return this.getRestaurantById(restaurantId);
  }
  
  /**
   * Delete restaurant
   */
  static async deleteRestaurant(restaurantId) {
    const connection = await getMySQLConnection();
    
    const [result] = await connection.query(
      'DELETE FROM restaurants WHERE restaurant_id = ?',
      [restaurantId]
    );
    
    return result.affectedRows > 0;
  }
  
  /**
   * Get restaurant statistics
   */
  static async getRestaurantStats(restaurantId) {
    const connection = await getMySQLConnection();
    
    const [stats] = await connection.query(`
      SELECT 
        COUNT(o.order_id) as total_orders,
        COUNT(CASE WHEN o.status = 'DELIVERED' THEN 1 END) as delivered_orders,
        COALESCE(SUM(CASE WHEN o.status = 'DELIVERED' THEN o.total_amount END), 0) as total_revenue,
        COALESCE(AVG(CASE WHEN o.status = 'DELIVERED' THEN o.total_amount END), 0) as avg_order_value
      FROM orders o
      WHERE o.restaurant_id = ?
    `, [restaurantId]);
    
    return stats[0];
  }
}

module.exports = RestaurantModel;
