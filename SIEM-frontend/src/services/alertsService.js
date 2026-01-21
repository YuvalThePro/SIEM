import api from './api';

/**
 * Fetch alerts with filtering and pagination
 * @param {Object} filters - Filter parameters
 * @param {string} filters.status - Alert status (open, closed)
 * @param {string} filters.severity - Alert severity (low, medium, high, critical)
 * @param {string} filters.from - Start date for alert filtering
 * @param {string} filters.to - End date for alert filtering
 * @param {number} filters.limit - Number of alerts per page
 * @param {number} filters.skip - Number of alerts to skip (for pagination)
 * @returns {Promise<{items: Array, page: {limit: number, skip: number, total: number}}>}
 */
export const getAlerts = async (filters = {}) => {
    try {
        const params = {};

        if (filters.status) {
            params.status = filters.status;
        }
        if (filters.severity) {
            params.severity = filters.severity;
        }
        if (filters.from) {
            params.from = filters.from;
        }
        if (filters.to) {
            params.to = filters.to;
        }
        if (filters.limit) {
            params.limit = filters.limit;
        }
        if (filters.skip !== undefined) {
            params.skip = filters.skip;
        }

        const response = await api.get('/alerts', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch alerts' };
    }
};

/**
 * Update alert status (close or reopen)
 * @param {string} id - Alert ID
 * @param {string} status - New status (open, closed)
 * @returns {Promise<{id: string, status: string, closedAt: Date, closedBy: string}>}
 */
export const updateAlertStatus = async (id, status) => {
    try {
        const response = await api.patch(`/alerts/${id}`, { status });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update alert status' };
    }
};
