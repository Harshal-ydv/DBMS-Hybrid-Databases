/**
 * Event Model
 * Handles MongoDB queries for order event logs
 */

const { getMongoConnection } = require('../config/database');

class EventModel {
  /**
   * Log an order event
   */
  static async logEvent(eventData) {
    const { db } = await getMongoConnection();
    
    // Ensure timestamp is a Date object
    const event = {
      ...eventData,
      timestamp: eventData.timestamp || new Date()
    };
    
    const result = await db.collection('order_events').insertOne(event);
    
    return {
      _id: result.insertedId,
      ...event
    };
  }
  
  /**
   * Get events for an order
   */
  static async getOrderEvents(orderId) {
    const { db } = await getMongoConnection();
    
    const events = await db.collection('order_events')
      .find({ order_id: parseInt(orderId) })
      .sort({ timestamp: 1 })
      .toArray();
    
    return events;
  }
  
  /**
   * Get recent events
   */
  static async getRecentEvents(limit = 50) {
    const { db } = await getMongoConnection();
    
    const events = await db.collection('order_events')
      .find({})
      .sort({ timestamp: -1 })
      .limit(parseInt(limit))
      .toArray();
    
    return events;
  }
  
  /**
   * Get peak hours (MongoDB Aggregation)
   */
  static async getPeakHours() {
    const { db } = await getMongoConnection();
    
    const results = await db.collection('order_events').aggregate([
      { $match: { status: 'PLACED' } },
      {
        $project: {
          hour: { $hour: '$timestamp' }
        }
      },
      {
        $group: {
          _id: '$hour',
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();
    
    return results.map(r => ({ hour: r._id, order_count: r.count }));
  }
  
  /**
   * Get order timeline (formatted for UI)
   */
  static async getOrderTimeline(orderId) {
    const { db } = await getMongoConnection();
    
    const events = await db.collection('order_events')
      .find({ order_id: parseInt(orderId) })
      .sort({ timestamp: 1 })
      .project({
        status: 1,
        by_role: 1,
        timestamp: 1,
        note: 1
      })
      .toArray();
    
    return events;
  }
  
  /**
   * Get events by date range
   */
  static async getEventsByDateRange(startDate, endDate) {
    const { db } = await getMongoConnection();
    
    const events = await db.collection('order_events')
      .find({
        timestamp: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      })
      .sort({ timestamp: -1 })
      .toArray();
    
    return events;
  }
  
  /**
   * Get delivery time analytics (MongoDB Aggregation)
   */
  static async getDeliveryTimeAnalytics() {
    const { db } = await getMongoConnection();
    
    // Group events by order and calculate delivery time
    const results = await db.collection('order_events').aggregate([
      {
        $match: {
          status: { $in: ['PLACED', 'DELIVERED'] }
        }
      },
      { $sort: { order_id: 1, timestamp: 1 } },
      {
        $group: {
          _id: '$order_id',
          events: { $push: { status: '$status', timestamp: '$timestamp' } }
        }
      },
      {
        $project: {
          order_id: '$_id',
          placed_time: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$events',
                  cond: { $eq: ['$$this.status', 'PLACED'] }
                }
              },
              0
            ]
          },
          delivered_time: {
            $arrayElemAt: [
              {
                $filter: {
                  input: '$events',
                  cond: { $eq: ['$$this.status', 'DELIVERED'] }
                }
              },
              0
            ]
          }
        }
      },
      {
        $project: {
          order_id: 1,
          delivery_time_minutes: {
            $divide: [
              { $subtract: ['$delivered_time.timestamp', '$placed_time.timestamp'] },
              1000 * 60
            ]
          }
        }
      },
      {
        $group: {
          _id: null,
          avg_delivery_time: { $avg: '$delivery_time_minutes' },
          min_delivery_time: { $min: '$delivery_time_minutes' },
          max_delivery_time: { $max: '$delivery_time_minutes' },
          total_deliveries: { $sum: 1 }
        }
      }
    ]).toArray();
    
    return results[0] || {
      avg_delivery_time: 0,
      min_delivery_time: 0,
      max_delivery_time: 0,
      total_deliveries: 0
    };
  }
  
  /**
   * Get status transition statistics
   */
  static async getStatusTransitionStats() {
    const { db } = await getMongoConnection();
    
    // Get consecutive status pairs by sorting and grouping
    const results = await db.collection('order_events').aggregate([
      { $sort: { order_id: 1, timestamp: 1 } },
      {
        $group: {
          _id: '$order_id',
          statuses: { $push: '$status' }
        }
      },
      {
        $project: {
          transitions: {
            $zip: {
              inputs: [
                { $slice: ['$statuses', 0, { $subtract: [{ $size: '$statuses' }, 1] }] },
                { $slice: ['$statuses', 1, { $size: '$statuses' }] }
              ]
            }
          }
        }
      },
      { $unwind: '$transitions' },
      {
        $group: {
          _id: {
            from: { $arrayElemAt: ['$transitions', 0] },
            to: { $arrayElemAt: ['$transitions', 1] }
          },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          from_status: '$_id.from',
          to_status: '$_id.to',
          transition_count: '$count',
          _id: 0
        }
      },
      { $sort: { transition_count: -1 } }
    ]).toArray();
    
    return results;
  }
}

module.exports = EventModel;
