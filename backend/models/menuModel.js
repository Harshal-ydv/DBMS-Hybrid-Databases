/**
 * Menu Model
 * Handles MongoDB queries for menu data
 */

const { getMongoConnection } = require('../config/database');
const { ObjectId } = require('mongodb');

class MenuModel {
  /**
   * Get menu for a restaurant
   */
  static async getMenuByRestaurant(restaurantId) {
    const { db } = await getMongoConnection();
    
    const menu = await db.collection('menus').findOne({
      restaurant_id: parseInt(restaurantId)
    });
    
    return menu;
  }
  
  /**
   * Get all menus
   */
  static async getAllMenus() {
    const { db } = await getMongoConnection();
    
    const menus = await db.collection('menus').find({}).toArray();
    
    return menus;
  }
  
  /**
   * Create or update menu for a restaurant
   */
  static async upsertMenu(restaurantId, menuData) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('menus').updateOne(
      { restaurant_id: parseInt(restaurantId) },
      { $set: menuData },
      { upsert: true }
    );
    
    return result;
  }
  
  /**
   * Add item to menu
   */
  static async addMenuItem(restaurantId, categoryName, itemData) {
    const { db } = await getMongoConnection();
    
    // Add ObjectId for the item
    itemData._id = new ObjectId();
    
    const result = await db.collection('menus').updateOne(
      { 
        restaurant_id: parseInt(restaurantId),
        'categories.name': categoryName
      },
      {
        $push: { 'categories.$.items': itemData }
      }
    );
    
    return { ...itemData, result };
  }
  
  /**
   * Delete menu for a restaurant
   */
  static async deleteMenu(restaurantId) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('menus').deleteOne({
      restaurant_id: parseInt(restaurantId)
    });
    
    return result.deletedCount > 0;
  }
  
  /**
   * Create a new menu
   */
  static async createMenu(menuData) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('menus').insertOne(menuData);
    
    return result;
  }
  
  /**
   * Update menu
   */
  static async updateMenu(restaurantId, updates) {
    const { db } = await getMongoConnection();
    
    const result = await db.collection('menus').updateOne(
      { restaurant_id: parseInt(restaurantId) },
      { $set: updates }
    );
    
    return result;
  }
  
  /**
   * Get popular items (MongoDB Aggregation)
   */
  static async getPopularItems(limit = 10) {
    const { db } = await getMongoConnection();
    
    const results = await db.collection('menus').aggregate([
      { $unwind: '$categories' },
      { $unwind: '$categories.items' },
      { $sort: { 'categories.items.orders_count': -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          restaurant_id: 1,
          restaurant_name: 1,
          item: '$categories.items',
          category: '$categories.name'
        }
      }
    ]).toArray();
    
    return results;
  }
  
  /**
   * Search items by name or description
   */
  static async searchItems(searchQuery) {
    const { db } = await getMongoConnection();
    
    const results = await db.collection('menus').aggregate([
      { $unwind: '$categories' },
      { $unwind: '$categories.items' },
      {
        $match: {
          $or: [
            { 'categories.items.name': { $regex: searchQuery, $options: 'i' } },
            { 'categories.items.description': { $regex: searchQuery, $options: 'i' } }
          ]
        }
      },
      {
        $project: {
          restaurant_id: 1,
          restaurant_name: 1,
          item: '$categories.items',
          category: '$categories.name'
        }
      }
    ]).toArray();
    
    return results;
  }
  
  /**
   * Get items by dietary preference
   */
  static async getItemsByDietaryPreference(preference) {
    const { db } = await getMongoConnection();
    
    const results = await db.collection('menus').aggregate([
      { $unwind: '$categories' },
      { $unwind: '$categories.items' },
      {
        $match: {
          'categories.items.dietary': {
            $elemMatch: { $regex: preference, $options: 'i' }
          }
        }
      },
      {
        $project: {
          restaurant_id: 1,
          restaurant_name: 1,
          item: '$categories.items',
          category: '$categories.name'
        }
      }
    ]).toArray();
    
    return results;
  }
}

module.exports = MenuModel;
