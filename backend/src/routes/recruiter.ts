import { Router } from 'express';
import { authMiddleware } from '../middleware/authMiddleware';
import { startConversation, submitAnswer, getRequirements } from '../controllers/jobRequirementsController';

const router = Router();

// All recruiter routes require authentication
router.use(authMiddleware);

// Job Requirements endpoints
router.post('/job-requirements/start', startConversation);
router.post('/job-requirements/:conversationId/answer', submitAnswer);
router.get('/job-requirements', getRequirements);

export default router;
