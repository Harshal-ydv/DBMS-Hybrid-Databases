/**
 * Review Model
 * Handles MongoDB queries for review data
 */

const { getMongoConnection } = require('../config/database');

class ReviewModel {
  /**
   * Create a new review
   */
  static async createReview(reviewData) {
    const { db } = await getMongoConnection();
    
    const review = {
      ...reviewData,
      created_at: new Date()
    };
    
    const result = await db.collection('reviews').insertOne(review);
    
    return {
      _id: result.insertedId,
      ...review
    };
  }
  
  /**
   * Get reviews for a restaurant
   */
  static async getRestaurantReviews(restaurantId) {
    const { db } = await getMongoConnection();
    
    const reviews = await db.collection('reviews')
      .find({ restaurant_id: parseInt(restaurantId) })
      .sort({ created_at: -1 })
      .toArray();
    
    return reviews;
  }
  
  /**
   * Get review by order ID
   */
  static async getReviewByOrder(orderId) {
    const { db } = await getMongoConnection();
    
    const review = await db.collection('reviews').findOne({
      order_id: parseInt(orderId)
    });
    
    return review;
  }
  
  /**
   * Get average rating for a restaurant (MongoDB Aggregation)
   */
  static async getRestaurantRating(restaurantId) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('reviews').aggregate([
      { $match: { restaurant_id: parseInt(restaurantId) } },
      {
        $group: {
          _id: '$restaurant_id',
          avg_restaurant_rating: { $avg: '$restaurant_rating' },
          avg_delivery_rating: { $avg: '$delivery_rating' },
          total_reviews: { $sum: 1 }
        }
      }
    ]).toArray();
    
    return result[0] || null;
  }
  
  /**
   * Get top rated restaurants (MongoDB Aggregation)
   */
  static async getTopRatedRestaurants(limit = 10) {
    const { db } = await getMongoConnection();
    
    const results = await db.collection('reviews').aggregate([
      {
        $group: {
          _id: '$restaurant_id',
          avg_rating: { $avg: '$restaurant_rating' },
          total_reviews: { $sum: 1 }
        }
      },
      { $sort: { avg_rating: -1 } },
      { $limit: parseInt(limit) }
    ]).toArray();
    
    return results;
  }
  
  /**
   * Get all reviews for a user
   */
  static async getUserReviews(userId) {
    const { db } = await getMongoConnection();
    
    const reviews = await db.collection('reviews')
      .find({ user_id: parseInt(userId) })
      .sort({ created_at: -1 })
      .toArray();
    
    return reviews;
  }
  
  /**
   * Get restaurant rating summary with breakdown
   */
  static async getRestaurantRatingSummary(restaurantId) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('reviews').aggregate([
      { $match: { restaurant_id: parseInt(restaurantId) } },
      {
        $group: {
          _id: '$restaurant_id',
          total_reviews: { $sum: 1 },
          average_rating: { $avg: '$rating' },
          avg_food_rating: { $avg: '$food_rating' },
          avg_delivery_rating: { $avg: '$delivery_rating' },
          avg_value_rating: { $avg: '$value_rating' }
        }
      },
      {
        $project: {
          restaurant_id: '$_id',
          total_reviews: 1,
          average_rating: { $round: ['$average_rating', 2] },
          avg_food_rating: { $round: ['$avg_food_rating', 2] },
          avg_delivery_rating: { $round: ['$avg_delivery_rating', 2] },
          avg_value_rating: { $round: ['$avg_value_rating', 2] },
          _id: 0
        }
      }
    ]).toArray();
    
    return result;
  }
  
  /**
   * Get recent reviews
   */
  static async getRecentReviews(limit = 20) {
    const { db } = await getMongoConnection();
    
    const reviews = await db.collection('reviews')
      .find()
      .sort({ created_at: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    return reviews;
  }
  
  /**
   * Update a review
   */
  static async updateReview(reviewId, updates) {
    const { db } = await getMongoConnection();
    const { ObjectId } = require('mongodb');
    
    updates.updated_at = new Date();
    
    const result = await db.collection('reviews').updateOne(
      { _id: new ObjectId(reviewId) },
      { $set: updates }
    );
    
    return result;
  }
  
  /**
   * Delete a review
   */
  static async deleteReview(reviewId) {
    const { db } = await getMongoConnection();
    const { ObjectId } = require('mongodb');
    
    const result = await db.collection('reviews').deleteOne({
      _id: new ObjectId(reviewId)
    });
    
    return result;
  }
}

module.exports = ReviewModel;
