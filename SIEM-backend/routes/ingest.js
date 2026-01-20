import express from 'express';
import { body, validationResult } from 'express-validator';
import Log from '../models/Log.js';
import apiKeyAuth from '../middleware/apiKeyAuth.js';
import { ingestRateLimiter } from '../middleware/rateLimiter.js';
import { checkBruteForce, createBruteForceAlert } from '../utils/alertRules.js';

const router = express.Router();

const ingestValidation = [
    body('source')
        .notEmpty().withMessage('source is required')
        .isString().withMessage('source must be a string')
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('source must be between 1 and 100 characters'),

    body('eventType')
        .optional()
        .isString().withMessage('eventType must be a string')
        .trim()
        .isLength({ min: 1, max: 100 }).withMessage('eventType must be between 1 and 100 characters'),

    body('message')
        .optional()
        .isString().withMessage('message must be a string')
        .isLength({ max: 1000 }).withMessage('message must be less than 1000 characters'),

    body('ts')
        .optional()
        .isISO8601().withMessage('ts must be a valid ISO 8601 date'),

    body('level')
        .optional()
        .isIn(['info', 'warn', 'error', 'critical']).withMessage('level must be one of: info, warn, error, critical'),

    body('ip')
        .optional()
        .isString().withMessage('ip must be a string')
        .trim()
        .isLength({ max: 45 }).withMessage('ip must be less than 45 characters'),

    body('user')
        .optional()
        .isString().withMessage('user must be a string')
        .trim()
        .isLength({ max: 100 }).withMessage('user must be less than 100 characters'),

    body().custom((value, { req }) => {
        if (!req.body.eventType && !req.body.message) {
            throw new Error('At least one of eventType or message is required');
        }
        return true;
    })
];

router.post('/', ingestRateLimiter, apiKeyAuth, ingestValidation, async (req, res) => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                error: 'Validation Error',
                message: errors.array().map(err => err.msg).join(', '),
                details: errors.array()
            });
        }

        const { ts, source, eventType, message, level, ip, user, path, method, status, userAgent } = req.body;

        const logData = {
            tenantId: req.tenantId,
            ts: ts ? new Date(ts) : new Date(),
            source,
            eventType: eventType || 'GENERIC_EVENT',
            message: message || '',
            level: level || 'info',
            raw: req.body
        };


        if (ip) logData.ip = ip;
        if (user) logData.user = user;

        const log = new Log(logData);
        await log.save();

        // Check for brute force pattern (fire and forget, don't block response)
        if (eventType === 'LOGIN_FAILED' && ip) {
            setImmediate(async () => {
                try {
                    const detection = await checkBruteForce(req.tenantId, ip);
                    if (detection) {
                        await createBruteForceAlert(req.tenantId, ip, detection.logs);
                    }
                } catch (err) {
                    console.error('Brute force detection error:', err);
                }
            });
        }

        // Return success with log ID
        res.status(201).json({
            ok: true,
            logId: log._id,
            receivedAt: log.createdAt
        });

    } catch (error) {
        console.error('Ingest error:', error);

        // Handle validation errors
        if (error.name === 'ValidationError') {
            return res.status(400).json({
                error: 'Validation Error',
                message: error.message
            });
        }

        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to ingest log'
        });
    }
});

export default router;
