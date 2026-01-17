import crypto from 'crypto';
import bcrypt from 'bcrypt';

/**
 * Generate a random API key
 * @param {number} length - Length of the key in bytes
 * @returns {string} - Hexadecimal string representation of the key
 */
export const generateApiKey = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Hash an API key using bcrypt
 * @param {string} key - The plain text API key
 * @param {number} saltRounds - Number of salt rounds
 * @returns {Promise<string>} - The hashed key
 */
export const hashApiKey = async (key, saltRounds = 10) => {
  return await bcrypt.hash(key, saltRounds);
};
