import express from 'express';
import {
  processPrompt,
  getAvailableModels,
  getServiceStatus
} from '../controllers/aiController.js';
import { protect } from '../middleware/auth.js';
import { validatePrompt } from '../middleware/validation.js';

const router = express.Router();

router.post('/process', protect, validatePrompt, processPrompt);
router.get('/models', protect, getAvailableModels);
router.get('/status', protect, getServiceStatus);

export default router;