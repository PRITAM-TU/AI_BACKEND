import AIService from '../services/aiService.js';
import TokenLog from '../models/TokenLog.js';

// @desc    Process AI prompt
// @route   POST /api/ai/process
// @access  Private
export const processPrompt = async (req, res) => {
  try {
    const { prompt, model } = req.body;
    const userId = req.user.id;

    console.log('🔵 Processing prompt for user:', userId);

    // Process the prompt through AI service
    const result = await AIService.processPrompt(prompt, model);

    if (result.success) {
      // Create token log in database
      const tokenLog = await TokenLog.create({
        user: userId,
        ...result.data
      });

      console.log('✅ AI processing completed, log saved:', tokenLog._id);

      res.json({
        success: true,
        data: {
          ...result.data,
          logId: tokenLog._id
        }
      });
    } else {
      // Log the error in database
      await TokenLog.create({
        user: userId,
        ...result.data
      });

      console.error('❌ AI processing failed:', result.error);

      res.status(500).json({
        success: false,
        message: 'AI processing failed',
        error: result.error
      });
    }
  } catch (error) {
    console.error('❌ Process prompt error:', error);
    res.status(500).json({
      success: false,
      message: 'Error processing AI prompt',
      error: error.message
    });
  }
};
// @desc    Get available AI models
// @route   GET /api/ai/models
// @access  Private
export const getAvailableModels = async (req, res) => {
  try {
    const models = await AIService.getAvailableModels();
    
    res.json({
      success: true,
      data: models
    });
  } catch (error) {
    console.error('Get models error:', error);
    res.status(500).json({
      success: false,
      message: 'Error fetching available models',
      error: error.message
    });
  }
};

// @desc    Get AI service status
// @route   GET /api/ai/status
// @access  Private
export const getServiceStatus = async (req, res) => {
  try {
    // Check if Hugging Face API is accessible
    const isHFAccessible = !!process.env.HUGGING_FACE_API_KEY;
    
    res.json({
      success: true,
      data: {
        huggingFace: {
          available: isHFAccessible,
          message: isHFAccessible ? 'Service available' : 'Hugging Face API key not configured'
        },
        timestamp: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error('Get service status error:', error);
    res.status(500).json({
      success: false,
      message: 'Error checking service status',
      error: error.message
    });
  }
};