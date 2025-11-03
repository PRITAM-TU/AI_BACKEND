import mongoose from 'mongoose';

const tokenLogSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: true
  },
  prompt: {
    type: String,
    required: [true, 'Please add a prompt'],
    maxlength: [10000, 'Prompt cannot be more than 10000 characters']
  },
  response: {
    type: String,
    maxlength: [20000, 'Response cannot be more than 20000 characters']
  },
  modelUsed: {
    type: String,
    required: true,
    enum: ['gpt-3.5-turbo', 'gpt-4', 'claude-2', 'llama-2-70b', 'mistral-7b', 'custom']
  },
  promptTokens: {
    type: Number,
    required: true,
    min: 0
  },
  completionTokens: {
    type: Number,
    required: true,
    min: 0
  },
  totalTokens: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedCost: {
    type: Number,
    required: true,
    min: 0
  },
  responseTime: {
    type: Number,
    required: true,
    min: 0
  },
  status: {
    type: String,
    enum: ['success', 'error', 'pending'],
    default: 'success'
  },
  errorMessage: {
    type: String
  },
  apiEndpoint: {
    type: String
  },
  userAgent: {
    type: String
  },
  ipAddress: {
    type: String
  }
}, {
  timestamps: true
});

// Index for better query performance
tokenLogSchema.index({ user: 1, createdAt: -1 });
tokenLogSchema.index({ createdAt: -1 });
tokenLogSchema.index({ modelUsed: 1 });

// Static method to get user stats
tokenLogSchema.statics.getUserStats = async function(userId) {
  const stats = await this.aggregate([
    {
      $match: { user: userId }
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

  return stats.length > 0 ? stats[0] : {
    totalTokens: 0,
    totalCost: 0,
    totalRequests: 0,
    avgResponseTime: 0
  };
};

export default mongoose.model('TokenLog', tokenLogSchema);