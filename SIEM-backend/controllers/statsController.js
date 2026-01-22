import mongoose from 'mongoose';
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
        
        // Convert tenantId string to ObjectId for aggregation queries
        const tenantObjectId = new mongoose.Types.ObjectId(tenantId);

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

        const timeQuery = {
            tenantId: tenantObjectId,
            ts: { $gte: from, $lte: to }
        };

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

            Log.aggregate([
                { $match: timeQuery },
                {
                    $group: {
                        _id: '$level',
                        count: { $sum: 1 }
                    }
                }
            ]),

            Alert.countDocuments({
                tenantId: tenantObjectId,
                status: 'open',
                ts: { $gte: from, $lte: to }
            }),

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

            Log.find(timeQuery)
                .sort({ ts: -1 })
                .limit(10)
                .select('ts level eventType source message ip user')
                .lean(),

            Alert.find({
                tenantId: tenantObjectId,
                ts: { $gte: from, $lte: to }
            })
                .sort({ ts: -1 })
                .limit(10)
                .select('ts ruleName severity status description')
                .lean()
        ]);

        const byLevel = {
            info: 0,
            warn: 0,
            error: 0,
            critical: 0
        };

        logsByLevel.forEach(item => {
            if (item._id && byLevel.hasOwnProperty(item._id)) {
                byLevel[item._id] = item.count;
            }
        });

        const formattedLogs = recentLogs.map(log => ({
            id: log._id,
            timestamp: log.ts,
            level: log.level,
            eventType: log.eventType,
            source: log.source,
            message: log.message,
            ip: log.ip,
            user: log.user
        }));

        const formattedAlerts = recentAlerts.map(alert => ({
            id: alert._id,
            timestamp: alert.ts,
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
                logs: formattedLogs,
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
