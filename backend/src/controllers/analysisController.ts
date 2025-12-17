import { Request, Response } from 'express';
import { extractResumeStructure, getClassificationSummary } from '../services/classificationService';
import { assessProfile } from '../services/assessmentService';
import { generateEnhancedRoadmap, getRoadmapCostSummary } from '../services/recommendationService';
import { ModelKey } from '../services/llmProvider';

/**
 * POST /api/analysis/classify
 * Extract structured data from resume text
 */
export const classifyResume = async (req: Request, res: Response) => {
    try {
        console.log('🔍 classifyResume called');
        const { resumeText, model } = req.body;

        if (!resumeText) {
            return res.status(400).json({ message: 'Resume text is required' });
        }

        console.log('🤖 Using model:', model || 'default');
        const classification = await extractResumeStructure(resumeText, model as ModelKey);
        const summary = getClassificationSummary(classification);

        console.log('✅ Resume classified successfully');
        res.status(200).json({ classification, summary });
    } catch (error) {
        console.error('❌ Error classifying resume:', error);
        res.status(500).json({ message: 'Failed to classify resume' });
    }
};

/**
 * POST /api/analysis/assess
 * Perform comprehensive profile assessment
 */
export const assessUserProfile = async (req: Request, res: Response) => {
    try {
        console.log('📊 assessUserProfile called');
        const { classification, targetRole, answers, model } = req.body;

        if (!classification || !targetRole) {
            return res.status(400).json({
                message: 'Classification and target role are required'
            });
        }

        console.log('🤖 Using model:', model || 'default');
        const assessment = await assessProfile(classification, targetRole, answers || {}, model as ModelKey);

        console.log('✅ Profile assessed successfully');
        res.status(200).json(assessment);
    } catch (error) {
        console.error('❌ Error assessing profile:', error);
        res.status(500).json({ message: 'Failed to assess profile' });
    }
};

/**
 * POST /api/analysis/recommend
 * Generate enhanced roadmap with specific resources
 */
export const generateRecommendations = async (req: Request, res: Response) => {
    try {
        console.log('🗺️ generateRecommendations called');
        const { assessment, model } = req.body;

        if (!assessment) {
            return res.status(400).json({ message: 'Assessment is required' });
        }

        console.log('🤖 Using model:', model || 'default');
        const roadmap = await generateEnhancedRoadmap(assessment, model as ModelKey);
        const costSummary = getRoadmapCostSummary(roadmap);

        console.log('✅ Recommendations generated successfully');
        res.status(200).json({ roadmap, costSummary });
    } catch (error) {
        console.error('❌ Error generating recommendations:', error);
        res.status(500).json({ message: 'Failed to generate recommendations' });
    }
};

/**
 * POST /api/analysis/complete
 * Complete end-to-end analysis: classify → assess → recommend
 */
export const completeAnalysis = async (req: Request, res: Response) => {
    try {
        console.log('🚀 completeAnalysis called');
        const { resumeText, targetRole, answers, model } = req.body;

        if (!resumeText || !targetRole) {
            return res.status(400).json({
                message: 'Resume text and target role are required'
            });
        }

        console.log('🤖 Using model:', model || 'default');
        const modelKey = model as ModelKey;

        // Step 1: Classify resume
        console.log('📝 Step 1: Classifying resume...');
        const classification = await extractResumeStructure(resumeText, modelKey);

        // Step 2: Assess profile
        console.log('📊 Step 2: Assessing profile...');
        const assessment = await assessProfile(classification, targetRole, answers || {}, modelKey);

        // Step 3: Generate recommendations
        console.log('🗺️ Step 3: Generating recommendations...');
        const roadmap = await generateEnhancedRoadmap(assessment, modelKey);

        console.log('✅ Complete analysis finished');
        res.status(200).json({
            classification,
            assessment,
            roadmap
        });
    } catch (error) {
        console.error('❌ Error in complete analysis:', error);
        res.status(500).json({ message: 'Failed to complete analysis' });
    }
};

