import express from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import * as sessionController from '../controllers/sessionController';

const router = express.Router();

// Apply authentication to all routes
router.use(authMiddleware);

// Get user's current session state
router.get('/state', sessionController.getSessionState);

// Update user's session state
router.post('/state', sessionController.updateSessionState);

export default router;
