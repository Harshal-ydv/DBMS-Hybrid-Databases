const menuModel = require('../models/menuModel');

// Get menu for a restaurant
exports.getRestaurantMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const menu = await menuModel.getMenuByRestaurant(restaurantId);
    
    if (!menu) {
      return res.status(404).json({ error: 'Menu not found for this restaurant' });
    }
    
    res.json(menu);
  } catch (error) {
    console.error('Get menu error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get all menus
exports.getAllMenus = async (req, res) => {
  try {
    const menus = await menuModel.getAllMenus();
    res.json(menus);
  } catch (error) {
    console.error('Get all menus error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Create new menu
exports.createMenu = async (req, res) => {
  try {
    const menuData = req.body;
    const result = await menuModel.createMenu(menuData);
    res.status(201).json({ 
      message: 'Menu created successfully', 
      menuId: result.insertedId 
    });
  } catch (error) {
    console.error('Create menu error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Update menu
exports.updateMenu = async (req, res) => {
  try {
    const { restaurantId } = req.params;
    const updates = req.body;
    const result = await menuModel.updateMenu(restaurantId, updates);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu not found' });
    }
    
    res.json({ 
      message: 'Menu updated successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Update menu error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Add item to menu
exports.addMenuItem = async (req, res) => {
  try {
    const { restaurantId, categoryName } = req.params;
    const item = req.body;
    const result = await menuModel.addMenuItem(restaurantId, categoryName, item);
    
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: 'Menu or category not found' });
    }
    
    res.json({ 
      message: 'Menu item added successfully',
      modifiedCount: result.modifiedCount 
    });
  } catch (error) {
    console.error('Add menu item error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get popular items
exports.getPopularItems = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const popularItems = await menuModel.getPopularItems(limit);
    res.json(popularItems);
  } catch (error) {
    console.error('Get popular items error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Search menu items
exports.searchMenuItems = async (req, res) => {
  try {
    const { query } = req.query;
    if (!query) {
      return res.status(400).json({ error: 'Search query is required' });
    }
    
    const results = await menuModel.searchItems(query);
    res.json(results);
  } catch (error) {
    console.error('Search menu items error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get items by dietary preference
exports.getItemsByDietaryPreference = async (req, res) => {
  try {
    const { preference } = req.params;
    const items = await menuModel.getItemsByDietaryPreference(preference);
    res.json(items);
  } catch (error) {
    console.error('Get dietary preference items error:', error);
    res.status(500).json({ error: error.message });
  }
};
