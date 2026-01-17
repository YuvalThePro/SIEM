import { verifyToken } from '../utils/jwt.js';

/**
 * Authentication middleware - verifies JWT token and attaches user info to request
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const authenticate = (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                error: 'Access denied. No token provided.'
            });
        }

        // Extract token (remove 'Bearer ' prefix)
        const token = authHeader.substring(7);
        const decoded = verifyToken(token);

        req.user = {
            userId: decoded.userId,
            tenantId: decoded.tenantId,
            role: decoded.role
        };

        next();
    } catch (error) {
        return res.status(403).json({
            error: 'Invalid or expired token.'
        });
    }
};
