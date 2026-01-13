import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// Health check endpoint
router.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting'
  };

  const healthCheck = {
    status: dbState === 1 ? 'ok' : 'error',
    timestamp: new Date().toISOString(),
    database: {
      status: dbStatus[dbState],
      readyState: dbState
    }
  };

  const statusCode = dbState === 1 ? 200 : 503;
  res.status(statusCode).json(healthCheck);
});

export default router;
