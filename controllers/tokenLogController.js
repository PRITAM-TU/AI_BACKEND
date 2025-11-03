import TokenLog from '../models/TokenLog.js';
import User from '../models/User.js';
import mongoose from 'mongoose';

// @desc    Create new token log
// @route   POST /api/logs
// @access  Private
export const createTokenLog = async (req, res) => {
  try {
    const userId = req.user.id;
    
    // Add user to req.body
    const logData = {
      ...req.body,
      user: userId
    };

    console.log('🔵 Creating new log:', logData);

    const tokenLog = await TokenLog.create(logData);

    console.log('✅ Log created:', tokenLog._id);

    res.status(201).json({
      success: true,
      data: tokenLog
    });
  } catch (error) {
    console.error('❌ Create token log error:', error);
    res.status(500).json({
      success: false,
      message: 'Error creating token log',
      error: error.message
    });
  }
};

// @desc    Get all token logs for user
// @route   GET /api/logs
// @access  Private
export const getTokenLogs = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔵 Fetching logs for user:', userId);
    
    const logs = await TokenLog.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    console.log('✅ Found logs:', logs.length);

    res.json({
      success: true,
      data: logs,
      count: logs.length
    });
  } catch (error) {
    console.error('❌ Get token logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching token logs',
      error: error.message
    });
  }
};

// @desc    Get user stats
// @route   GET /api/logs/stats
// @access  Private
export const getUserStats = async (req, res) => {
  try {
    const userId = req.user.id;
    
    console.log('🔵 Fetching stats for user:', userId);

    // Get stats using aggregation
    const stats = await TokenLog.aggregate([
      {
        $match: { 
          user: new mongoose.Types.ObjectId(userId),
          status: 'success'
        }
      },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$estimatedCost' },
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' }
        }
      }
    ]);

    // If no logs found, return default values
    const result = stats.length > 0 ? stats[0] : {
      totalTokens: 0,
      totalCost: 0,
      totalRequests: 0,
      avgResponseTime: 0
    };

    // Remove the _id field
    delete result._id;

    console.log('✅ Stats calculated:', result);

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    console.error('❌ Get user stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching user stats',
      error: error.message
    });
  }
};

// @desc    Get analytics data
// @route   GET /api/logs/analytics
// @access  Private
export const getAnalytics = async (req, res) => {
  try {
    const { period = '30d' } = req.query;
    
    let startDate = new Date();
    switch (period) {
      case '7d':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(startDate.getDate() - 90);
        break;
      default:
        startDate.setDate(startDate.getDate() - 30);
    }

    const analytics = await TokenLog.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: null,
          totalTokens: { $sum: '$totalTokens' },
          totalCost: { $sum: '$estimatedCost' },
          totalRequests: { $sum: 1 },
          avgResponseTime: { $avg: '$responseTime' },
          models: { $addToSet: '$modelUsed' }
        }
      }
    ]);

    // Get hourly distribution
    const hourlyUsage = await TokenLog.aggregate([
      {
        $match: {
          user: req.user.id,
          createdAt: { $gte: startDate }
        }
      },
      {
        $group: {
          _id: { $hour: '$createdAt' },
          requestCount: { $sum: 1 },
          totalTokens: { $sum: '$totalTokens' }
        }
      },
      {
        $sort: { '_id': 1 }
      }
    ]);

    res.json({
      success: true,
      data: {
        summary: analytics[0] || {
          totalTokens: 0,
          totalCost: 0,
          totalRequests: 0,
          avgResponseTime: 0,
          models: []
        },
        hourlyUsage
      }
    });
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching analytics',
      error: error.message
    });
  }
};

// @desc    Export logs as CSV
// @route   GET /api/logs/export
// @access  Private
export const exportLogs = async (req, res) => {
  try {
    const logs = await TokenLog.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .lean();

    // Convert to CSV
    const csvHeaders = 'Timestamp,Model,Prompt Tokens,Completion Tokens,Total Tokens,Cost,Response Time,Status\n';
    
    const csvRows = logs.map(log => 
      `"${new Date(log.createdAt).toISOString()}","${log.modelUsed}",${log.promptTokens},${log.completionTokens},${log.totalTokens},${log.estimatedCost},${log.responseTime},"${log.status}"`
    ).join('\n');

    const csv = csvHeaders + csvRows;

    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=token-usage-export.csv');
    res.send(csv);
  } catch (error) {
    console.error('Export logs error:', error);
    res.status(500).json({
      success: false,
      message: 'Error exporting logs',
      error: error.message
    });
  }
};