import express from 'express';
import { authenticate } from '../middleware/auth.js';
import { getStats } from '../controllers/statsController.js';

const router = express.Router();

/**
 * GET /api/stats
 * Get aggregated statistics for dashboard
 * Protected route - requires JWT authentication
 */
router.get('/', authenticate, getStats);

export default router;
