import api from './api';

/**
 * Fetch dashboard statistics with aggregated data
 * @param {string} range - Time range for statistics (24h, 7d, 30d)
 * @returns {Promise<Object>} - Statistics object with counts, top lists, and recent activity
 */
export const getStats = async (range = '24h') => {
    try {
        const params = { range };
        const response = await api.get('/stats', { params });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch statistics' };
    }
};
