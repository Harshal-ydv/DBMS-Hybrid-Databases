/**
 * Analytics Controller
 * Handles HTTP requests for analytics and reporting
 */

const AnalyticsModel = require('../models/analyticsModel');

class AnalyticsController {
  /**
   * GET /api/analytics/dashboard
   * Get overall dashboard statistics
   */
  static async getDashboardStats(req, res) {
    try {
      const stats = await AnalyticsModel.getSystemStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch dashboard statistics',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/restaurant-revenue
   * Get restaurant revenue (from MySQL view)
   */
  static async getRestaurantRevenue(req, res) {
    try {
      const limit = req.query.limit;
      const revenue = await AnalyticsModel.getRestaurantRevenue(limit);
      
      res.json({
        success: true,
        count: revenue.length,
        data: revenue
      });
    } catch (error) {
      console.error('Error fetching restaurant revenue:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch restaurant revenue',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/top-customers
   * Get top customers by spending
   */
  static async getTopCustomers(req, res) {
    try {
      const limit = req.query.limit || 10;
      const customers = await AnalyticsModel.getTopCustomers(limit);
      
      res.json({
        success: true,
        count: customers.length,
        data: customers
      });
    } catch (error) {
      console.error('Error fetching top customers:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch top customers',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/active-deliveries
   * Get currently active deliveries
   */
  static async getActiveDeliveries(req, res) {
    try {
      const deliveries = await AnalyticsModel.getActiveDeliveries();
      
      res.json({
        success: true,
        count: deliveries.length,
        data: deliveries
      });
    } catch (error) {
      console.error('Error fetching active deliveries:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch active deliveries',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/orders-by-status
   * Get order distribution by status
   */
  static async getOrdersByStatus(req, res) {
    try {
      const stats = await AnalyticsModel.getOrdersByStatus();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching orders by status:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders by status',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/orders-by-time
   * Get orders grouped by time period
   */
  static async getOrdersByTime(req, res) {
    try {
      const stats = await AnalyticsModel.getOrdersByTimePeriod();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching orders by time:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch orders by time',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/peak-hours
   * Get hourly order distribution
   */
  static async getPeakHours(req, res) {
    try {
      const stats = await AnalyticsModel.getOrdersByHour();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching peak hours:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch peak hours',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/cuisine-popularity
   * Get cuisine type popularity
   */
  static async getCuisinePopularity(req, res) {
    try {
      const stats = await AnalyticsModel.getCuisinePopularity();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching cuisine popularity:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch cuisine popularity',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/partner-performance
   * Get delivery partner performance metrics
   */
  static async getPartnerPerformance(req, res) {
    try {
      const stats = await AnalyticsModel.getPartnerPerformance();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching partner performance:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch partner performance',
        message: error.message
      });
    }
  }
  
  /**
   * GET /api/analytics/payment-methods
   * Get payment method distribution
   */
  static async getPaymentMethods(req, res) {
    try {
      const stats = await AnalyticsModel.getPaymentMethodStats();
      
      res.json({
        success: true,
        data: stats
      });
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      res.status(500).json({
        success: false,
        error: 'Failed to fetch payment method statistics',
        message: error.message
      });
    }
  }
}

module.exports = AnalyticsController;
