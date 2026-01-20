import ApiKey from '../models/ApiKey.js';
import { generateApiKey, hashApiKey } from '../utils/crypto.js';

/**
 * List all API keys for the authenticated user's tenant
 * GET /api/api-keys
 */
export const listApiKeys = async (req, res) => {
    try {
        const apiKeys = await ApiKey.find({ tenantId: req.user.tenantId })
            .select('-keyHash')
            .sort({ createdAt: -1 });

        const response = apiKeys.map(key => ({
            id: key._id,
            name: key.name,
            enabled: key.enabled,
            lastUsed: key.lastUsed,
            createdAt: key.createdAt
        }));

        res.status(200).json(response);
    } catch (error) {
        console.error('List API keys error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to list API keys'
        });
    }
};

/**
 * Create a new API key
 * POST /api/api-keys
 * Returns the raw key ONCE - it will never be shown again
 */
export const createApiKey = async (req, res) => {
    try {
        const { name } = req.body;

        if (!name || typeof name !== 'string' || name.trim().length === 0) {
            return res.status(400).json({
                error: 'Validation Error',
                message: 'Name is required and must be a non-empty string'
            });
        }

        const keyLength = parseInt(process.env.API_KEY_LENGTH || '32', 10);
        const rawKey = `ak_live_${generateApiKey(keyLength)}`;

        const keyHash = await hashApiKey(rawKey, 10);

        const apiKey = await ApiKey.create({
            tenantId: req.user.tenantId,
            name: name.trim(),
            keyHash,
            enabled: true
        });

        res.status(201).json({
            apiKey: {
                id: apiKey._id,
                name: apiKey.name,
                enabled: apiKey.enabled,
                createdAt: apiKey.createdAt
            },
            rawKey: rawKey
        });
    } catch (error) {
        console.error('Create API key error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to create API key'
        });
    }
};

/**
 * Revoke an API key (set enabled=false)
 * PATCH /api/api-keys/:id/revoke
 */
export const revokeApiKey = async (req, res) => {
    try {
        const { id } = req.params;

        const apiKey = await ApiKey.findOne({
            _id: id,
            tenantId: req.user.tenantId
        });

        if (!apiKey) {
            return res.status(404).json({
                error: 'Not Found',
                message: 'API key not found or does not belong to your tenant'
            });
        }

        apiKey.enabled = false;
        await apiKey.save();

        res.status(200).json({
            ok: true,
            message: 'API key revoked successfully',
            apiKey: {
                id: apiKey._id,
                name: apiKey.name,
                enabled: apiKey.enabled
            }
        });
    } catch (error) {
        console.error('Revoke API key error:', error);
        res.status(500).json({
            error: 'Internal Server Error',
            message: 'Failed to revoke API key'
        });
    }
};
