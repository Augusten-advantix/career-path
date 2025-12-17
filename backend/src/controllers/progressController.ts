import { Request, Response } from 'express';
import RoadmapProgress from '../models/RoadmapProgress';
import { initializeProgress, updateStepCompletion, calculateCompletionPercentage } from '../services/progressService';

/**
 * POST /api/roadmap/save
 * Save a new roadmap with initialized progress tracking
 */
export const saveRoadmap = async (req: Request, res: Response) => {
    try {
        console.log('💾 Saving new roadmap');
        const { roadmapData } = req.body;
        const userId = (req as any).user.id;

        if (!roadmapData || !roadmapData.roadmap) {
            return res.status(400).json({ message: 'Roadmap data is required' });
        }

        // Handle both old format (roadmap is array) and new format (roadmap.steps is array)
        const roadmapSteps = Array.isArray(roadmapData.roadmap)
            ? roadmapData.roadmap  // Old format: { roadmap: [...] }
            : roadmapData.roadmap.steps;  // New enhanced format: { roadmap: { steps: [...] } }

        if (!roadmapSteps || !Array.isArray(roadmapSteps)) {
            return res.status(400).json({ message: 'Invalid roadmap format' });
        }

        // Initialize progress for all roadmap steps
        const createdAt = new Date();
        const progress = initializeProgress(roadmapSteps, createdAt);

        const roadmap = await RoadmapProgress.create({
            userId,
            roadmapData,
            progress,
        });

        console.log('✅ Roadmap saved with ID:', roadmap.id);
        res.status(201).json({ id: roadmap.id, roadmapData, progress });
    } catch (error) {
        console.error('❌ Error saving roadmap:', error);
        res.status(500).json({ message: 'Failed to save roadmap' });
    }
};

/**
 * GET /api/roadmap/latest
 * Get the user's most recent roadmap with current progress
 */
export const getLatestRoadmap = async (req: Request, res: Response) => {
    try {
        console.log('📖 Fetching latest roadmap');
        const userId = (req as any).user.id;

        const roadmap = await RoadmapProgress.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']],
        });

        if (!roadmap) {
            return res.status(404).json({ message: 'No roadmap found' });
        }

        const completionPercentage = calculateCompletionPercentage(roadmap.progress as any);

        console.log('✅ Latest roadmap found, ID:', roadmap.id);
        res.status(200).json({
            id: roadmap.id,
            roadmapData: roadmap.roadmapData,
            progress: roadmap.progress,
            completionPercentage,
            createdAt: roadmap.createdAt,
            updatedAt: roadmap.updatedAt,
        });
    } catch (error) {
        console.error('❌ Error fetching roadmap:', error);
        res.status(500).json({ message: 'Failed to fetch roadmap' });
    }
};

/**
 * PATCH /api/roadmap/:id/progress
 * Update progress for a specific roadmap step
 */
export const updateProgress = async (req: Request, res: Response) => {
    try {
        console.log('✏️ Updating roadmap progress');
        const { id } = req.params;
        const { stepId, completed } = req.body;
        const userId = (req as any).user.id;

        if (typeof completed !== 'boolean') {
            return res.status(400).json({ message: 'Completed status must be a boolean' });
        }

        const roadmap = await RoadmapProgress.findOne({
            where: { id, userId },
        });

        if (!roadmap) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        // Update the specific step's completion status
        const updatedProgress = updateStepCompletion(
            roadmap.progress as any,
            stepId,
            completed
        );

        await roadmap.update({ progress: updatedProgress });

        const completionPercentage = calculateCompletionPercentage(updatedProgress as any);

        console.log(`✅ Step ${stepId} marked as ${completed ? 'complete' : 'incomplete'}`);
        res.status(200).json({
            progress: updatedProgress,
            completionPercentage,
        });
    } catch (error) {
        console.error('❌ Error updating progress:', error);
        res.status(500).json({ message: 'Failed to update progress' });
    }
};

/**
 * GET /api/roadmap/all
 * Get all roadmaps for the user (history)
 */
export const getAllRoadmaps = async (req: Request, res: Response) => {
    try {
        console.log('📚 Fetching all roadmaps');
        const userId = (req as any).user.id;

        const roadmaps = await RoadmapProgress.findAll({
            where: { userId },
            order: [['createdAt', 'DESC']],
            attributes: ['id', 'createdAt', 'updatedAt', 'progress'],
        });

        const roadmapsWithCompletion = roadmaps.map((r) => ({
            id: r.id,
            createdAt: r.createdAt,
            updatedAt: r.updatedAt,
            completionPercentage: calculateCompletionPercentage(r.progress as any),
        }));

        console.log(`✅ Found ${roadmaps.length} roadmaps`);
        res.status(200).json(roadmapsWithCompletion);
    } catch (error) {
        console.error('❌ Error fetching roadmaps:', error);
        res.status(500).json({ message: 'Failed to fetch roadmaps' });
    }
};
