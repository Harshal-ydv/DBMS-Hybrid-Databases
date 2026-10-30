const eventModel = require('../models/eventModel');

// Get events for an order
exports.getOrderEvents = async (req, res) => {
  try {
    const { orderId } = req.params;
    const events = await eventModel.getOrderEvents(orderId);
    res.json(events);
  } catch (error) {
    console.error('Get order events error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Log new event
exports.logEvent = async (req, res) => {
  try {
    const eventData = req.body;
    
    // Validate required fields
    if (!eventData.order_id || !eventData.status) {
      return res.status(400).json({ 
        error: 'Missing required fields: order_id, status' 
      });
    }
    
    const result = await eventModel.logEvent(eventData);
    res.status(201).json({ 
      message: 'Event logged successfully', 
      eventId: result.insertedId 
    });
  } catch (error) {
    console.error('Log event error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get order timeline
exports.getOrderTimeline = async (req, res) => {
  try {
    const { orderId } = req.params;
    const timeline = await eventModel.getOrderTimeline(orderId);
    res.json(timeline);
  } catch (error) {
    console.error('Get order timeline error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get events by date range
exports.getEventsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({ 
        error: 'Both startDate and endDate are required' 
      });
    }
    
    const events = await eventModel.getEventsByDateRange(
      new Date(startDate), 
      new Date(endDate)
    );
    res.json(events);
  } catch (error) {
    console.error('Get events by date range error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get delivery time analytics
exports.getDeliveryTimeAnalytics = async (req, res) => {
  try {
    const analytics = await eventModel.getDeliveryTimeAnalytics();
    res.json(analytics);
  } catch (error) {
    console.error('Get delivery time analytics error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get status transition stats
exports.getStatusTransitionStats = async (req, res) => {
  try {
    const stats = await eventModel.getStatusTransitionStats();
    res.json(stats);
  } catch (error) {
    console.error('Get status transition stats error:', error);
    res.status(500).json({ error: error.message });
  }
};

// Get recent events (activity feed)
exports.getRecentEvents = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;
    const events = await eventModel.getRecentEvents(limit);
    res.json(events);
  } catch (error) {
    console.error('Get recent events error:', error);
    res.status(500).json({ error: error.message });
  }
};
