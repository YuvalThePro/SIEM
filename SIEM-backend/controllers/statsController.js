import Log from '../models/Log.js';
import Alert from '../models/Alert.js';

/**
 * Get dashboard statistics with aggregated data
 * GET /api/stats
 * Protected route - requires JWT authentication
 */
export const getStats = async (req, res) => {
    try {
        const { tenantId } = req.user;


        const range = req.query.range || '24h';

        let from, to;


        if (req.query.from && req.query.to) {
            from = new Date(req.query.from);
            to = new Date(req.query.to);


            if (isNaN(from.getTime()) || isNaN(to.getTime())) {
                return res.status(400).json({
                    error: 'Invalid date format. Use ISO 8601 format.'
                });
            }

            if (from > to) {
                return res.status(400).json({
                    error: 'Start date must be before end date.'
                });
            }
        } else {
            to = new Date();

            let hours;
            switch (range) {
                case '7d':
                    hours = 7 * 24;
                    break;
                case '30d':
                    hours = 30 * 24;
                    break;
                case '24h':
                default:
                    hours = 24;
                    break;
            }

            from = new Date(to.getTime() - hours * 60 * 60 * 1000);
        }

        // Build query for time range
        const timeQuery = {
            tenantId,
            ts: { $gte: from, $lte: to }
        };

        // Execute all aggregations in parallel
        const [
            totalLogs,
            logsByLevel,
            openAlerts,
            topIps,
            topEventTypes,
            recentLogs,
            recentAlerts
        ] = await Promise.all([

            Log.countDocuments(timeQuery),

            // Logs grouped by level
            Log.aggregate([
                { $match: timeQuery },
                {
                    $group: {
                        _id: '$level',
                        count: { $sum: 1 }
                    }
                }
            ]),

            // Open alerts count
            Alert.countDocuments({
                tenantId,
                status: 'open',
                ts: { $gte: from, $lte: to }
            }),

            // Top 10 IPs
            Log.aggregate([
                {
                    $match: {
                        ...timeQuery,
                        ip: { $exists: true, $ne: null, $ne: '' }
                    }
                },
                {
                    $group: {
                        _id: '$ip',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        _id: 0,
                        ip: '$_id',
                        count: 1
                    }
                }
            ]),

            // Top 10 Event Types
            Log.aggregate([
                {
                    $match: {
                        ...timeQuery,
                        eventType: { $exists: true, $ne: null, $ne: '' }
                    }
                },
                {
                    $group: {
                        _id: '$eventType',
                        count: { $sum: 1 }
                    }
                },
                { $sort: { count: -1 } },
                { $limit: 10 },
                {
                    $project: {
                        _id: 0,
                        eventType: '$_id',
                        count: 1
                    }
                }
            ]),

            // Recent 10 logs
            Log.find(timeQuery)
                .sort({ ts: -1 })
                .limit(10)
                .select('ts level eventType source message ip user')
                .lean(),

            // Recent 10 alerts
            Alert.find({
                tenantId,
                ts: { $gte: from, $lte: to }
            })
                .sort({ ts: -1 })
                .limit(10)
                .select('ts ruleName severity status description')
                .lean()
        ]);

        // Process logs by level into object
        const byLevel = {
            info: 0,
            warn: 0,
            error: 0
        };

        logsByLevel.forEach(item => {
            if (item._id && byLevel.hasOwnProperty(item._id)) {
                byLevel[item._id] = item.count;
            }
        });


        const formattedAlerts = recentAlerts.map(alert => ({
            id: alert._id,
            ts: alert.ts,
            ruleName: alert.ruleName,
            severity: alert.severity,
            status: alert.status,
            description: alert.description
        }));


        const response = {
            range: {
                from: from.toISOString(),
                to: to.toISOString()
            },
            counts: {
                totalLogs,
                byLevel,
                openAlerts
            },
            topIps,
            topEventTypes,
            recent: {
                logs: recentLogs,
                alerts: formattedAlerts
            }
        };

        res.status(200).json(response);

    } catch (error) {
        console.error('Get stats error:', error);
        res.status(500).json({
            error: 'Failed to retrieve statistics.'
        });
    }
};
