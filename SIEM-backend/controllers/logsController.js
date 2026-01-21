import Log from '../models/Log.js';

/**
 * Get logs with filtering and pagination
 * GET /api/logs
 * Protected route - requires JWT authentication
 */
export const getLogs = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const query = { tenantId };

        // Filter by IDs (for fetching matched logs)
        if (req.query.ids) {
            const ids = req.query.ids.split(',').map(id => id.trim());
            query._id = { $in: ids };
        }

        // Date range filter (from/to on ts field)
        if (req.query.from || req.query.to) {
            query.ts = {};
            if (req.query.from) {
                query.ts.$gte = new Date(req.query.from);
            }
            if (req.query.to) {
                query.ts.$lte = new Date(req.query.to);
            }
        }

        if (req.query.level) {
            query.level = req.query.level;
        }
        if (req.query.source) {
            query.source = req.query.source;
        }
        if (req.query.eventType) {
            query.eventType = req.query.eventType;
        }
        if (req.query.ip) {
            query.ip = req.query.ip;
        }
        if (req.query.user) {
            query.user = req.query.user;
        }
        if (req.query.q) {
            query.message = { $regex: req.query.q, $options: 'i' };
        }

        // Pagination
        const limit = Math.min(parseInt(req.query.limit) || 50, 200); // Limit to prevent excessive load
        const skip = parseInt(req.query.skip) || 0; // Offset for pagination

        const [items, total] = await Promise.all([
            Log.find(query)
                .sort({ ts: -1 }) // Newest first
                .limit(limit)
                .skip(skip)
                .lean(), // Get as json
            Log.countDocuments(query) // Total count for pagination
        ]);

        // Return formatted response
        res.status(200).json({
            items,
            page: {
                limit,
                skip,
                total
            }
        });
    } catch (error) {
        console.error('Get logs error:', error);
        res.status(500).json({
            error: 'Failed to retrieve logs.'
        });
    }
};
