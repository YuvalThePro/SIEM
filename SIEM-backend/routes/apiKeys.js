import express from 'express';
import { body } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import { listApiKeys, createApiKey, revokeApiKey } from '../controllers/apiKeysController.js';

const router = express.Router();

/**
 * GET /api/api-keys
 * List all API keys for the authenticated admin's tenant
 */
router.get('/', authenticate, requireAdmin, listApiKeys);

/**
 * POST /api/api-keys
 * Create a new API key
 * Returns the raw key once - it will never be shown again
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    [
        body('name')
            .notEmpty().withMessage('Name is required')
            .isString().withMessage('Name must be a string')
            .trim()
            .isLength({ min: 1, max: 100 }).withMessage('Name must be between 1 and 100 characters')
    ],
    createApiKey
);

/**
 * PATCH /api/api-keys/:id/revoke
 * Revoke an API key (set enabled=false)
 */
router.patch('/:id/revoke', authenticate, requireAdmin, revokeApiKey);

export default router;
