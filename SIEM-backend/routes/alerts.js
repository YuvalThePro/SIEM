import express from 'express';
import { body } from 'express-validator';
import { getAlerts, updateAlertStatus } from '../controllers/alertsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * GET /api/alerts
 * Get alerts with filtering and pagination
 * Protected route - requires JWT authentication
 */
router.get('/', authenticate, getAlerts);

/**
 * PATCH /api/alerts/:id
 * Update alert status (close/reopen)
 * Protected route - requires JWT authentication
 */
router.patch(
    '/:id',
    authenticate,
    [
        body('status')
            .notEmpty().withMessage('Status is required')
            .isIn(['open', 'closed']).withMessage('Status must be either "open" or "closed"')
    ],
    updateAlertStatus
);

export default router;
