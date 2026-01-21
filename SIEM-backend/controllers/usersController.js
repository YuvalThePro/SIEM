import User from '../models/User.js';
import { hashApiKey } from '../utils/crypto.js';

/**
 * Helper: Check if user would be the last admin in tenant
 */
const isLastAdmin = async (tenantId, excludeUserId = null) => {
    const query = {
        tenantId,
        role: 'admin'
    };
    if (excludeUserId) {
        query._id = { $ne: excludeUserId };
    }
    const adminCount = await User.countDocuments(query);
    return adminCount === 0;
};

/**
 * Get all users in the authenticated user's tenant
 * GET /api/users
 * Protected route - requires JWT authentication and admin role
 */
export const getUsers = async (req, res) => {
    try {
        const { tenantId } = req.user;

        const users = await User.find({ tenantId })
            .select('-passwordHash')
            .sort({ createdAt: -1 })
            .lean();

        const items = users.map(user => ({
            id: user._id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        }));

        res.status(200).json(items);

    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            error: 'Failed to retrieve users.'
        });
    }
};

/**
 * Create a new user in the tenant
 * POST /api/users
 * Protected route - requires JWT authentication and admin role
 */
export const createUser = async (req, res) => {
    try {
        const { tenantId } = req.user;
        const { email, password, role } = req.body;

        const existingUser = await User.findOne({ tenantId, email });
        if (existingUser) {
            return res.status(409).json({
                error: 'Email already exists in your organization'
            });
        }

        const passwordHash = await hashApiKey(password, 10);

        const user = await User.create({
            tenantId,
            email,
            passwordHash,
            role: role || 'viewer'
        });

        res.status(201).json({
            id: user._id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error('Create user error:', error);

        if (error.code === 11000) {
            return res.status(409).json({
                error: 'Email already exists in your organization'
            });
        }

        res.status(500).json({
            error: 'Failed to create user.'
        });
    }
};

/**
 * Update user role
 * PATCH /api/users/:id/role
 * Protected route - requires JWT authentication and admin role
 */
export const updateUserRole = async (req, res) => {
    try {
        const { tenantId, userId } = req.user;
        const { id } = req.params;
        const { role } = req.body;

        if (userId.toString() === id.toString()) {
            return res.status(400).json({
                error: 'Cannot change your own role'
            });
        }

        const user = await User.findOne({ _id: id, tenantId });

        if (!user) {
            return res.status(404).json({
                error: 'User not found or does not belong to your organization'
            });
        }

        if (user.role === 'admin' && role !== 'admin') {
            const wouldBeLastAdmin = await isLastAdmin(tenantId, id);
            if (wouldBeLastAdmin) {
                return res.status(400).json({
                    error: 'Cannot demote the last admin in your organization'
                });
            }
        }

        user.role = role;
        await user.save();

        res.status(200).json({
            id: user._id,
            email: user.email,
            role: user.role,
            createdAt: user.createdAt
        });

    } catch (error) {
        console.error('Update user role error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        res.status(500).json({
            error: 'Failed to update user role.'
        });
    }
};

/**
 * Delete user from tenant
 * DELETE /api/users/:id
 * Protected route - requires JWT authentication and admin role
 */
export const deleteUser = async (req, res) => {
    try {
        const { tenantId, userId } = req.user;
        const { id } = req.params;

        // Prevent deleting self
        if (userId.toString() === id.toString()) {
            return res.status(400).json({
                error: 'Cannot delete your own account'
            });
        }

        const user = await User.findOne({ _id: id, tenantId });

        if (!user) {
            return res.status(404).json({
                error: 'User not found or does not belong to your organization'
            });
        }

        if (user.role === 'admin') {
            const wouldBeLastAdmin = await isLastAdmin(tenantId, id);
            if (wouldBeLastAdmin) {
                return res.status(400).json({
                    error: 'Cannot delete the last admin in your organization'
                });
            }
        }

        await User.deleteOne({ _id: id });

        res.status(200).json({
            message: 'User deleted successfully'
        });

    } catch (error) {
        console.error('Delete user error:', error);

        if (error.name === 'CastError') {
            return res.status(400).json({
                error: 'Invalid user ID'
            });
        }

        res.status(500).json({
            error: 'Failed to delete user.'
        });
    }
};
