import express from 'express';
import {
  createTokenLog,
  getTokenLogs,
  getUserStats,
  getAnalytics,
  exportLogs
} from '../controllers/tokenLogController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Make sure all routes start with /api/logs
router.get('/', protect, getTokenLogs); // GET /api/logs
router.get('/stats', protect, getUserStats); // GET /api/logs/stats
router.get('/analytics', protect, getAnalytics); // GET /api/logs/analytics
router.get('/export', protect, exportLogs); // GET /api/logs/export
router.post('/', protect, createTokenLog); // POST /api/logs

export default router;