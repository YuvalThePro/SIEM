import bcrypt from 'bcryptjs';
import Tenant from '../models/Tenant.js';
import User from '../models/User.js';
import { generateToken } from '../utils/jwt.js';

/**
 * Register a new tenant and admin user
 * POST /api/auth/register
 */
export const register = async (req, res) => {
    try {
        const { companyName, email, password } = req.body;
        if (!companyName || !email || !password) {
            return res.status(400).json({
                error: 'Please provide companyName, email, and password'
            });
        }
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(409).json({
                error: 'Email already registered'
            });
        }
        const tenant = await Tenant.create({
            name: companyName
        });
        const passwordHash = await bcrypt.hash(password, 10);

        // Create admin user
        const user = await User.create({
            tenantId: tenant._id,
            email,
            passwordHash,
            role: 'admin'
        });
        const token = generateToken(user._id.toString(), tenant._id.toString(), user.role);
        res.status(201).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            tenant: {
                id: tenant._id,
                name: tenant.name
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            error: 'Registration failed. Please try again.'
        });
    }
};

/**
 * Login with email and password
 * POST /api/auth/login
 */
export const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({
                error: 'Please provide email and password'
            });
        }

        const user = await User.findOne({ email }).populate('tenantId');
        if (!user) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }

        const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
        if (!isPasswordValid) {
            return res.status(401).json({
                error: 'Invalid credentials'
            });
        }
        const token = generateToken(user._id.toString(), user.tenantId._id.toString(), user.role);
        res.status(200).json({
            token,
            user: {
                id: user._id,
                email: user.email,
                role: user.role
            },
            tenant: {
                id: user.tenantId._id,
                name: user.tenantId.name
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            error: 'Login failed. Please try again.'
        });
    }
};
