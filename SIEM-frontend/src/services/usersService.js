import api from './api';

/**
 * Get all users in the tenant
 * @returns {Promise<Array>} List of users
 */
export const getUsers = async () => {
    try {
        const response = await api.get('/users');
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to fetch users' };
    }
};

/**
 * Create a new user in the tenant
 * @param {string} email - User email
 * @param {string} password - User password
 * @param {string} role - User role (admin, analyst, viewer)
 * @returns {Promise<Object>} Created user object
 */
export const createUser = async (email, password, role) => {
    try {
        const response = await api.post('/users', {
            email,
            password,
            role
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to create user' };
    }
};

/**
 * Update user role
 * @param {string} userId - User ID
 * @param {string} role - New role (admin, analyst, viewer)
 * @returns {Promise<Object>} Updated user object
 */
export const updateUserRole = async (userId, role) => {
    try {
        const response = await api.patch(`/users/${userId}/role`, {
            role
        });
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to update user role' };
    }
};

/**
 * Delete user from tenant
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Success message
 */
export const deleteUser = async (userId) => {
    try {
        const response = await api.delete(`/users/${userId}`);
        return response.data;
    } catch (error) {
        throw error.response?.data || { error: 'Failed to delete user' };
    }
};

export default {
    getUsers,
    createUser,
    updateUserRole,
    deleteUser
};
