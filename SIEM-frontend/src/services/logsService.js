import api from './api';

/**
 * Fetch logs with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {string} filters.from - Start date for log filtering
 * @param {string} filters.to - End date for log filtering
 * @param {string} filters.level - Log level (info, warn, error, critical)
 * @param {string} filters.source - Source system
 * @param {string} filters.eventType - Event type
 * @param {string} filters.ip - IP address
 * @param {string} filters.user - Username
 * @param {string} filters.q - Search query for message field
 * @param {number} filters.limit - Number of logs per page
 * @param {number} filters.skip - Number of logs to skip (for pagination)
 * @returns {Promise<{items: Array, page: {limit: number, skip: number, total: number}}>}
 */
export const getLogs = async (filters = {}) => {
    try {
        const params = {};

        if (filters.from) {
            params.from = filters.from;
        }
        if (filters.to) {
            params.to = filters.to;
        }
        if (filters.level) {
            params.level = filters.level;
        }
        if (filters.source) {
            params.source = filters.source;
        }
        if (filters.eventType) {
            params.eventType = filters.eventType;
        }
        if (filters.ip) {
            params.ip = filters.ip;
        }
        if (filters.user) {
            params.user = filters.user;
        }
        if (filters.q) {
            params.q = filters.q;
        }
        if (filters.limit) {
            params.limit = filters.limit;
        }
        if (filters.skip !== undefined) {
            params.skip = filters.skip;
        }

        const response = await api.get('/logs', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch logs' };
    }
};
