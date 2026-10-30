const reviewModel = require('../models/reviewModel');

// Get reviews for a restaurant
exports.getRestaurantReviews = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const reviews = await reviewModel.getRestaurantReviews(restaurantId);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get restaurant reviews error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Get reviews by user
exports.getUserReviews = async (req, res) => {
  try {
    const { userId } = req.params;
    const reviews = await reviewModel.getUserReviews(userId);
    res.json({
      success: true,
      count: reviews.length,
      data: reviews
    });
  } catch (error) {
    console.error('Get user reviews error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Create new review
exports.createReview = async (req, res) => {
  try {
    const reviewData = req.body;
    
    // Validate required fields
    if (!reviewData.order_id || !reviewData.user_id || !reviewData.restaurant_id) {
      return res.status(400).json({ 
        error: 'Missing required fields: order_id, user_id, restaurant_id' 
      });
    }
    
    // Validate at least one rating is provided
    if (!reviewData.restaurant_rating && !reviewData.delivery_rating) {
      return res.status(400).json({
        error: 'At least one rating (restaurant_rating or delivery_rating) is required'
      });
    }
    
    const result = await reviewModel.createReview(reviewData);
    res.status(201).json({ 
      success: true,
      message: 'Review created successfully', 
      data: {
        reviewId: result.insertedId 
      }
    });
  } catch (error) {
    console.error('Create review error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
};

// Update review
exports.updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const updates = req.body;
    const result = await reviewModel.updateReview(reviewId, updates);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ 
      message: 'Review updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Update review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Delete review
exports.deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const result = await reviewModel.deleteReview(reviewId);
    
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: 'Review not found' });
    }
    
    res.json({ message: 'Review deleted successfully' });
  } catch (error) {
    console.error('Delete review error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get restaurant rating summary
exports.getRestaurantRatingSummary = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const summary = await reviewModel.getRestaurantRatingSummary(restaurantId);
    
    if (summary.length === 0) {
      return res.json({ 
        restaurant_id: parseInt(restaurantId),
        total_reviews: 0,
        average_rating: 0,
        rating_distribution: []
      });
    }
    
    res.json(summary[0]);
  } catch (error) {
    console.error('Get rating summary error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get top-rated restaurants
exports.getTopRatedRestaurants = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const minReviews = parseInt(req.query.minReviews) || 3;
    const topRestaurants = await reviewModel.getTopRatedRestaurants(limit, minReviews);
    res.json(topRestaurants);
  } catch (error) {
    console.error('Get top-rated restaurants error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get recent reviews
exports.getRecentReviews = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 20;
    const reviews = await reviewModel.getRecentReviews(limit);
    res.json(reviews);
  } catch (error) {
    console.error('Get recent reviews error:', error);
    res.status(500).json({ error: error.message });
  }
};
