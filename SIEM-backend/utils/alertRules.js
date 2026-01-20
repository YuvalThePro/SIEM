import Log from '../models/Log.js';
import Alert from '../models/Alert.js';

/**
 * Check if a brute force attack pattern is detected
 * Rule: 5 LOGIN_FAILED events from same IP within 60 seconds
 * 
 * @param {ObjectId} tenantId - The tenant ID
 * @param {String} ip - The IP address to check
 * @returns {Promise<Object|null>} - Returns { count, logs } if pattern detected, null otherwise
 */
export const checkBruteForce = async (tenantId, ip) => {
    try {
        const sixtySecondsAgo = new Date(Date.now() - 60 * 1000);

        // Query for LOGIN_FAILED events from this IP in last 60 seconds
        const logs = await Log.find({
            tenantId,
            eventType: 'LOGIN_FAILED',
            ip,
            ts: { $gte: sixtySecondsAgo }
        })
            .sort({ ts: -1 })
            .limit(10)
            .select('_id ts message')
            .lean();

        const count = logs.length;

        if (count >= 5) {
            return { count, logs };
        }

        return null;
    } catch (error) {
        console.error('Check brute force error:', error);
        return null;
    }
};

/**
 * Create a brute force alert with deduplication
 * Prevents creating duplicate alerts for the same tenant+ip
 * 
 * @param {ObjectId} tenantId - The tenant ID
 * @param {String} ip - The IP address
 * @param {Array} matchedLogs - Array of log documents that matched the rule
 * @returns {Promise<Object|null>} - Returns created alert or null if dedupe prevented creation
 */
export const createBruteForceAlert = async (tenantId, ip, matchedLogs) => {
    try {
        const dedupeKey = `BRUTEFORCE:${tenantId}:${ip}`;

        // Check if an open alert already exists with this dedupe key
        const existingAlert = await Alert.findOne({
            tenantId,
            dedupeKey,
            status: 'open'
        });

        if (existingAlert) {
            console.log(`Brute force alert already exists for ${ip}, skipping creation`);
            return null;
        }

        // Extract log IDs
        const matchedLogIds = matchedLogs.map(log => log._id);

        const alert = await Alert.create({
            tenantId,
            ts: new Date(),
            ruleName: 'Brute Force Detection',
            severity: 'high',
            description: `Detected ${matchedLogs.length} failed login attempts from IP ${ip} within 60 seconds`,
            status: 'open',
            entities: { ip },
            dedupeKey,
            matchedLogIds
        });

        console.log(`Created brute force alert ${alert._id} for IP ${ip}`);
        return alert;

    } catch (error) {
        // Handle duplicate key error (race condition)
        if (error.code === 11000) {
            console.log(`Duplicate alert prevented for IP ${ip} (race condition)`);
            return null;
        }

        console.error('Create brute force alert error:', error);
        return null;
    }
};
