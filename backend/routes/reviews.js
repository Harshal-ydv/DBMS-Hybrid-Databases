const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// Get recent reviews
router.get('/recent', reviewController.getRecentReviews);

// Get top-rated restaurants
router.get('/top-rated', reviewController.getTopRatedRestaurants);

// Get reviews for a restaurant
router.get('/restaurant/:restaurantId', reviewController.getRestaurantReviews);

// Get restaurant rating summary
router.get('/restaurant/:restaurantId/summary', reviewController.getRestaurantRatingSummary);

// Get reviews by user
router.get('/user/:userId', reviewController.getUserReviews);

// Create new review
router.post('/', reviewController.createReview);

// Update review
router.put('/:reviewId', reviewController.updateReview);

// Delete review
router.delete('/:reviewId', reviewController.deleteReview);

module.exports = router;
