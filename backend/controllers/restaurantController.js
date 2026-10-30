/**
 * Restaurant Controller
 * Handles HTTP requests for restaurant operations
 */

const RestaurantModel = require('../models/restaurantModel');

class RestaurantController {
  /**
   * GET /api/restaurants
   * Get all restaurants with optional filters
   */
  static async getAllRestaurants(req, res) {
    try {
      const filters = {
        city: req.query.city,
        cuisine_type: req.query.cuisine_type,
        is_open: req.query.is_open
      };
      
      const restaurants = await RestaurantModel.getAllRestaurants(filters);
      
      res.json({
        success: true,
        count: restaurants.length,
        data: restaurants
      });
    } catch (error) {
      console.error('Error fetching restaurants:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurants',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/restaurants/:id
   * Get single restaurant by ID
   */
  static async getRestaurantById(req, res) {
    try {
      const restaurantId = req.params.id;
      const restaurant = await RestaurantModel.getRestaurantWithOwner(restaurantId);
      
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }
      
      // Get statistics
      const stats = await RestaurantModel.getRestaurantStats(restaurantId);
      
      res.json({
        success: true,
        data: {
          ...restaurant,
          statistics: stats
        }
      });
    } catch (error) {
      console.error('Error fetching restaurant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurant',
        message: error.message
      });
    }
  }
  
  /**
   * POST /api/restaurants
   * Create new restaurant
   */
  static async createRestaurant(req, res) {
    try {
      const { owner_id, name, city, address, cuisine_type, is_open } = req.body;
      
      // Validation
      if (!owner_id || !name || !city || !address) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: owner_id, name, city, address'
        });
      }
      
      const restaurant = await RestaurantModel.createRestaurant({
        owner_id,
        name,
        city,
        address,
        cuisine_type,
        is_open
      });
      
      res.status(201).json({
        success: true,
        message: 'Restaurant created successfully',
        data: restaurant
      });
    } catch (error) {
      console.error('Error creating restaurant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to create restaurant',
        message: error.message
      });
    }
  }
  
  /**
   * PUT /api/restaurants/:id
   * Update restaurant
   */
  static async updateRestaurant(req, res) {
    try {
      const restaurantId = req.params.id;
      const updates = req.body;
      
      const restaurant = await RestaurantModel.updateRestaurant(restaurantId, updates);
      
      if (!restaurant) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Restaurant updated successfully',
        data: restaurant
      });
    } catch (error) {
      console.error('Error updating restaurant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to update restaurant',
        message: error.message
      });
    }
  }
  
  /**
   * DELETE /api/restaurants/:id
   * Delete restaurant
   */
  static async deleteRestaurant(req, res) {
    try {
      const restaurantId = req.params.id;
      const deleted = await RestaurantModel.deleteRestaurant(restaurantId);
      
      if (!deleted) {
        return res.status(404).json({
          success: false,
          error: 'Restaurant not found'
        });
      }
      
      res.json({
        success: true,
        message: 'Restaurant deleted successfully'
      });
    } catch (error) {
      console.error('Error deleting restaurant:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to delete restaurant',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/restaurants/:id/stats
   * Get restaurant statistics
   */
  static async getRestaurantStats(req, res) {
    try {
      const restaurantId = req.params.id;
      const stats = await RestaurantModel.getRestaurantStats(restaurantId);
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch statistics',
        message: error.message
      });
    }
  }
}

module.exports = RestaurantController;
