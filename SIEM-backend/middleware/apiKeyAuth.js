import bcrypt from 'bcrypt';
import ApiKey from '../models/ApiKey.js';

/**
 * Middleware to authenticate requests using x-api-key header
 * Validates the API key, checks if it's enabled, and attaches tenant context to the request
 */
const apiKeyAuth = async (req, res, next) => {
  try {
    // Extract API key from header
    const rawKey = req.headers['x-api-key'];
    
    if (!rawKey) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Missing x-api-key header'
      });
    }

    const apiKeys = await ApiKey.find({ enabled: true });

    // Try to find a matching key by comparing with bcrypt
    let matchedApiKey = null;
    for (const apiKey of apiKeys) {
      const isMatch = await bcrypt.compare(rawKey, apiKey.keyHash);
      if (isMatch) {
        matchedApiKey = apiKey;
        break;
      }
    }

    if (!matchedApiKey) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        message: 'Invalid or disabled API key'
      });
    }

    // Attach tenant context to request
    req.tenantId = matchedApiKey.tenantId;
    req.apiKeyId = matchedApiKey._id;

    // Update last used timestamp 
    ApiKey.findByIdAndUpdate(
      matchedApiKey._id, 
      { lastUsed: new Date() },
      { timestamps: false } // Dont update updatedAt. because this is a lastUsed update only.
    ).catch(err => console.error('Failed to update lastUsed:', err));

    next();
  } catch (error) {
    console.error('API key authentication error:', error);
    res.status(500).json({ 
      error: 'Internal Server Error',
      message: 'Authentication failed'
    });
  }
};

export default apiKeyAuth;
