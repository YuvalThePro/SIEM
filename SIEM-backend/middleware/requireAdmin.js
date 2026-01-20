/**
 * Middleware to check if authenticated user has admin role
 * Must be used after authenticate middleware
 * @param {object} req - Express request object
 * @param {object} res - Express response object
 * @param {function} next - Express next middleware function
 */
export const requireAdmin = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            error: 'Unauthorized',
            message: 'Authentication required'
        });
    }

    if (req.user.role !== 'admin') {
        return res.status(403).json({
            error: 'Forbidden',
            message: 'Admin access required'
        });
    }

    next();
};
