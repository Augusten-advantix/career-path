import express from 'express';
import { uploadMiddleware, uploadResume } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

import { getQuestionnaire, submitQuestionnaire } from '../controllers/questionnaireController';

import { analyzeCareerPath } from '../controllers/roadmapController';

router.post('/upload', authMiddleware, uploadMiddleware, uploadResume);
router.get('/questions', authMiddleware, getQuestionnaire);
router.post('/questions', authMiddleware, submitQuestionnaire);
router.post('/analyze', authMiddleware, analyzeCareerPath);

export default router;
