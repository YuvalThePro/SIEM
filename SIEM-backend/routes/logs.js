import express from 'express';
import { getLogs } from '../controllers/logsController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();
router.get('/', authenticate, getLogs);

export default router;
