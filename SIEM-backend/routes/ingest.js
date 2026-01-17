import express from 'express';
import Log from '../models/Log.js';
import apiKeyAuth from '../middleware/apiKeyAuth.js';

const router = express.Router();


router.post('/', apiKeyAuth, async (req, res) => {
    try {
        const { ts, source, eventType, message, level, ip, user, path, method, status, userAgent } = req.body;

        // Validate required fields
        if (!source) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'Missing required field: source'
            });
        }

        if (!eventType && !message) {
            return res.status(400).json({
                error: 'Bad Request',
                message: 'At least one of eventType or message is required'
            });
        }

        // Build log document
        const logData = {
            tenantId: req.tenantId,
            ts: ts ? new Date(ts) : new Date(),
            source,
            eventType: eventType || 'GENERIC_EVENT',
            message: message || '',
            level: level || 'info',
            raw: req.body // Store the full original payload
        };


        if (ip) logData.ip = ip;
        if (user) logData.user = user;

        // Create and save the log
        const log = new Log(logData);
        await log.save();

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
