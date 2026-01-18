import api from './api';

/**
 * Register a new user and tenant
 * @param {string} companyName - Name of the company/tenant
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, user: object, tenant: object}>}
 */
export const registerUser = async (companyName, email, password) => {
  try {
    const response = await api.post('/auth/register', {
      companyName,
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Registration failed' };
  }
};

/**
 * Login with email and password
 * @param {string} email - User email
 * @param {string} password - User password
 * @returns {Promise<{token: string, user: object, tenant: object}>}
 */
export const loginUser = async (email, password) => {
  try {
    const response = await api.post('/auth/login', {
      email,
      password
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Login failed' };
  }
};

/**
 * Get current authenticated user info
 * @returns {Promise<{user: object, tenant: object}>}
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error.response?.data || { error: 'Failed to fetch user info' };
  }
};

export default {
  registerUser,
  loginUser,
  getCurrentUser
};
