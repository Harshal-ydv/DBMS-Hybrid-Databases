const express = require('express');
const router = express.Router();
const menuController = require('../controllers/menuController');

// Get all menus
router.get('/', menuController.getAllMenus);

// Get menu for specific restaurant
router.get('/restaurant/:restaurantId', menuController.getRestaurantMenu);

// Search menu items
router.get('/search', menuController.searchMenuItems);

// Get popular items
router.get('/popular', menuController.getPopularItems);

// Get items by dietary preference
router.get('/dietary/:preference', menuController.getItemsByDietaryPreference);

// Create new menu
router.post('/', menuController.createMenu);

// Update menu
router.put('/restaurant/:restaurantId', menuController.updateMenu);

// Add item to menu category
router.post('/restaurant/:restaurantId/category/:categoryName/item', menuController.addMenuItem);

module.exports = router;
