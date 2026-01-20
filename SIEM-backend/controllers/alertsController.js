import Alert from '../models/Alert.js';

/**
 * Get alerts with filtering and pagination
 * GET /api/alerts
 * Protected route - requires JWT authentication
 */
export const getAlerts = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const query = { tenantId };

        if (req.query.status) {
            if (!['open', 'closed'].includes(req.query.status)) {
                return res.status(400).json({
                    error: 'Status must be either "open" or "closed"'
                });
            }
            query.status = req.query.status;
        }

        if (req.query.from || req.query.to) {
            query.ts = {};
            if (req.query.from) {
                query.ts.$gte = new Date(req.query.from);
            }
            if (req.query.to) {
                query.ts.$lte = new Date(req.query.to);
            }
        }

        if (req.query.severity) {
            if (!['low', 'medium', 'high', 'critical'].includes(req.query.severity)) {
                return res.status(400).json({
                    error: 'Severity must be one of: low, medium, high, critical'
                });
            }
            query.severity = req.query.severity;
        }

        const limit = Math.min(parseInt(req.query.limit) || 25, 100);
        const skip = parseInt(req.query.skip) || 0;

        const [alerts, total] = await Promise.all([
            Alert.find(query)
                .sort({ ts: -1 })
                .limit(limit)
                .skip(skip)
                .lean(),
            Alert.countDocuments(query)
        ]);

        const items = alerts.map(alert => ({
            id: alert._id,
            tenantId: alert.tenantId,
            ts: alert.ts,
            ruleName: alert.ruleName,
            severity: alert.severity,
            description: alert.description,
            status: alert.status,
            entities: alert.entities,
            matchedLogIds: alert.matchedLogIds,
            closedAt: alert.closedAt,
            closedBy: alert.closedBy,
            createdAt: alert.createdAt,
            updatedAt: alert.updatedAt
        }));

        res.status(200).json({
            items,
            page: {
                limit,
                skip,
                total
            }
        });

    } catch (error) {
        console.error('Get alerts error:', error);
        res.status(500).json({
            error: 'Failed to retrieve alerts.'
        });
    }
};

/**
 * Update alert status (close/reopen)
 * PATCH /api/alerts/:id
 * Protected route - requires JWT authentication
 */
export const updateAlertStatus = async (req, res) => {
    try {
        const { tenantId, userId } = req.user;
        const { id } = req.params;
        const { status } = req.body;

        // Validate status
        if (!status) {
            return res.status(400).json({
                error: 'Status is required'
            });
        }

        if (!['open', 'closed'].includes(status)) {
            return res.status(400).json({
                error: 'Status must be either "open" or "closed"'
            });
        }

        // Find alert and verify tenant ownership
        const alert = await Alert.findOne({
            _id: id,
            tenantId: tenantId
        });

        if (!alert) {
            return res.status(404).json({
                error: 'Alert not found or does not belong to your tenant'
            });
        }

        // Update status
        if (status === 'closed') {
            alert.status = 'closed';
            alert.closedAt = new Date();
            alert.closedBy = userId;
        } else {
            alert.status = 'open';
            alert.closedAt = null;
            alert.closedBy = null;
        }

        await alert.save();

        res.status(200).json({
            id: alert._id,
            status: alert.status,
            closedAt: alert.closedAt,
            closedBy: alert.closedBy
        });

    } catch (error) {
        console.error('Update alert status error:', error);

        // Handle invalid ObjectId
        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid alert ID'
            });
        }

        res.status(500).json({
            error: 'Failed to update alert status'
        });
    }
};
