import rateLimit from 'express-rate-limit';

/**
 * Rate limiter for ingest endpoint
 * Limits requests to prevent abuse and ensure system stability
 */
export const ingestRateLimiter = rateLimit({
    windowMs: 1 * 60 * 1000, // 1 minute
    max: 100, // 100 requests per ip
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        error: 'Too Many Requests',
        message: 'Too many log ingestion requests, please try again later.'
    },

    skipSuccessfulRequests: false,

    skipFailedRequests: false
});
