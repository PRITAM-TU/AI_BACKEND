import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import connectDB from './config/database.js';

// Route imports
import authRoutes from './routes/auth.js';
import logRoutes from './routes/logs.js';
import aiRoutes from './routes/ai.js';

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

// Body parser middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));

// Cookie parser
app.use(cookieParser());

// CORS middleware - UPDATED FOR PRODUCTION
app.use(cors({
  origin: [
    'https://ai-token-tracker-dashboard.vercel.app',
    'http://localhost:3000',
    'https://your-frontend-domain.vercel.app'
  ],
  credentials: true
}));

// Rate limiting (simple version)
app.use((req, res, next) => {
  // Simple rate limiting - consider using express-rate-limit in production
  next();
});

// Mount routers
app.use('/api/auth', authRoutes);
app.use('/api/logs', logRoutes);
app.use('/api/ai', aiRoutes);

// Health check route - UPDATED
app.get('/api/health', (req, res) => {
  res.json({
    success: true,
    message: 'AI Token Tracker API is running on Render',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV,
    baseUrl: process.env.BASE_URL
  });
});

// Root route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'Welcome to AI Token Tracker Backend API',
    version: '1.0.0',
    documentation: 'https://github.com/PRITAM-TU/AI-Token-Tracker-Dashboard-',
    endpoints: {
      auth: '/api/auth',
      logs: '/api/logs', 
      ai: '/api/ai',
      health: '/api/health'
    }
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.stack
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Route not found',
    path: req.originalUrl
  });
});

const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
  console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  console.log(`📊 API Base URL: ${process.env.BASE_URL || `http://localhost:${PORT}`}`);
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
  console.log('Unhandled Rejection at:', promise, 'reason:', err);
  // Close server & exit process
  server.close(() => {
    process.exit(1);
  });
});

export default app;