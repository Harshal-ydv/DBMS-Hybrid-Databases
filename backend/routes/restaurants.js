/**
 * Restaurant Routes
 * Defines API endpoints for restaurant operations
 */

const express = require('express');
const router = express.Router();
const RestaurantController = require('../controllers/restaurantController');

// GET /api/restaurants - Get all restaurants
router.get('/', RestaurantController.getAllRestaurants);

// GET /api/restaurants/:id - Get single restaurant
router.get('/:id', RestaurantController.getRestaurantById);

// POST /api/restaurants - Create new restaurant
router.post('/', RestaurantController.createRestaurant);

// PUT /api/restaurants/:id - Update restaurant
router.put('/:id', RestaurantController.updateRestaurant);

// DELETE /api/restaurants/:id - Delete restaurant
router.delete('/:id', RestaurantController.deleteRestaurant);

// GET /api/restaurants/:id/stats - Get restaurant statistics
router.get('/:id/stats', RestaurantController.getRestaurantStats);

module.exports = router;
