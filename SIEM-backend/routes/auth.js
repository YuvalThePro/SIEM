import express from 'express';
import { body } from 'express-validator';
import { register, login, me } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

router.post(
    '/register',
    [
        body('email')
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .isLength({ min: 8 })
            .withMessage('Password must be at least 8 characters'),
        body('companyName')
            .notEmpty()
            .withMessage('Company name is required')
    ],
    register
);

router.post(
    '/login',
    [
        body('email')
            .isEmail()
            .withMessage('Valid email is required')
            .normalizeEmail(),
        body('password')
            .notEmpty()
            .withMessage('Password is required')
    ],
    login
);

router.get('/me', authenticate, me);

export default router;
