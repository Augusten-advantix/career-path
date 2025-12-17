import express from 'express';
import { enqueueAnalysis, getAnalysisStatus } from '../controllers/analysisController';
import { authenticateToken } from '../middleware/auth';

const router = express.Router();

router.post('/analysis/bulk', authenticateToken, enqueueAnalysis);
router.get('/analysis/:id', authenticateToken, getAnalysisStatus);

export default router;
