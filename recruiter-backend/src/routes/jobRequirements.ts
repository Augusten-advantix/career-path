import { Router } from 'express';
import { startConversation, submitAnswer, getRequirements, deleteRequirement } from '../controllers/jobRequirementsController';
import { authenticateToken } from '../middleware/auth';

const router = Router();

router.post('/start', authenticateToken, startConversation);
router.post('/:conversationId/answer', authenticateToken, submitAnswer);
router.get('/', authenticateToken, getRequirements);
router.delete('/:id', authenticateToken, deleteRequirement);

export default router;
