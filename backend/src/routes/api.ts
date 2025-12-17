import express from 'express';
import { uploadMiddleware, uploadResume } from '../controllers/uploadController';
import { authMiddleware } from '../middleware/authMiddleware';

const router = express.Router();

import { getQuestionnaire, submitQuestionnaire } from '../controllers/questionnaireController';

import { analyzeCareerPath, updateProfileBasedOnProgress, getLatestRoadmap } from '../controllers/roadmapController';
import { startConversation, getNextQuestion } from '../controllers/conversationController';
import { classifyResume, completeAnalysis } from '../controllers/analysisController';

router.post('/upload', authMiddleware, uploadMiddleware, uploadResume);
router.get('/questions', authMiddleware, getQuestionnaire);
router.post('/questions', authMiddleware, submitQuestionnaire);
router.post('/analyze', authMiddleware, analyzeCareerPath);

// Conversation routes
router.post('/conversation/start', authMiddleware, startConversation);
router.post('/conversation/next', authMiddleware, getNextQuestion);

// Analysis routes
router.post('/analysis/classify', authMiddleware, classifyResume);
router.post('/analysis/complete', authMiddleware, completeAnalysis);

// Roadmap updates
router.post('/roadmap/:id/update-overview', authMiddleware, updateProfileBasedOnProgress);
router.get('/roadmap/latest', authMiddleware, getLatestRoadmap);

// LLM Models endpoint
import { getAvailableModels } from '../services/llmProvider';
router.get('/models', (req, res) => {
    res.json(getAvailableModels());
});

export default router;

