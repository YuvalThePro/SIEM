import express from 'express';
import { body, param } from 'express-validator';
import { authenticate } from '../middleware/auth.js';
import { requireAdmin } from '../middleware/requireAdmin.js';
import {
    getUsers,
    createUser,
    updateUserRole,
    deleteUser
} from '../controllers/usersController.js';

const router = express.Router();

/**
 * GET /api/users
 * List all users in the tenant
 * Protected route - requires JWT authentication and admin role
 */
router.get('/', authenticate, requireAdmin, getUsers);

/**
 * POST /api/users
 * Create a new user in the tenant
 * Protected route - requires JWT authentication and admin role
 */
router.post(
    '/',
    authenticate,
    requireAdmin,
    [
        body('email')
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 6 })
            .withMessage('Password must be at least 6 characters'),
        body('role')
            .optional()
            .isIn(['admin', 'analyst', 'viewer'])
            .withMessage('Role must be admin, analyst, or viewer')
    ],
    createUser
);

/**
 * PATCH /api/users/:id/role
 * Update user role
 * Protected route - requires JWT authentication and admin role
 */
router.patch(
    '/:id/role',
    authenticate,
    requireAdmin,
    [
        param('id')
            .isMongoId()
            .withMessage('Valid user ID is required'),
        body('role')
            .isIn(['admin', 'analyst', 'viewer'])
            .withMessage('Role must be admin, analyst, or viewer')
    ],
    updateUserRole
);

/**
 * DELETE /api/users/:id
 * Delete user from tenant
 * Protected route - requires JWT authentication and admin role
 */
router.delete(
    '/:id',
    authenticate,
    requireAdmin,
    [
        param('id')
            .isMongoId()
            .withMessage('Valid user ID is required')
    ],
    deleteUser
);

export default router;
