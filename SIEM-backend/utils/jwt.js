import jwt from 'jsonwebtoken';

/**
 * Generate a JWT token for a user
 * @param {string} userId - The user's ID
 * @param {string} tenantId - The tenant's ID
 * @param {string} role - The user's role (admin, analyst, viewer)
 * @returns {string} JWT token
 */
export const generateToken = (userId, tenantId, role) => {
    const payload = {
        userId,
        tenantId,
        role
    };

    return jwt.sign(payload, process.env.JWT_SECRET, {
        expiresIn: '7d'
    });
};

/**
 * Verify and decode a JWT token
 * @param {string} token - The JWT token to verify
 * @returns {object} Decoded token payload { userId, tenantId, role }
 * @throws {Error} If token is invalid or expired
 */
export const verifyToken = (token) => {
    try {
        return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
        throw new Error('Invalid or expired token');
    }
};
