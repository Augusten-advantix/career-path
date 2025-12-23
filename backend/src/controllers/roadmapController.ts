import { Request, Response } from 'express';
import { analyzeProfile, updateProfileWithCode } from '../services/llm';
import { parseDocument } from '../services/parser';
import path from 'path';
import RoadmapProgress from '../models/RoadmapProgress';
import AnalysisJob from '../models/AnalysisJob';
import Profile from '../models/Profile';
import { ModelKey } from '../services/llmProvider';

export const analyzeCareerPath = async (req: Request, res: Response) => {
    try {
        console.log('🚀 analyzeCareerPath called');
        const { answers, resumePath, resumeText: providedText, model, profileId } = req.body;

        console.log('📋 Request body:', {
            hasAnswers: !!answers,
            answersCount: answers ? Object.keys(answers).length : 0,
            resumePath: resumePath,
            hasResumeText: !!providedText,
            resumeTextLength: providedText ? providedText.length : 0,
            model: model || 'default',
            profileId: profileId
        });

        let resumeText = providedText;

        if (!resumeText) {
            console.log('⚠️ No resume text provided, checking for resumePath...');
            if (!resumePath) {
                console.error('❌ No resumePath found either!');
                return res.status(400).json({ message: 'Resume not found. Please upload a resume first.' });
            }
            console.log('📂 Attempting to parse resume from path:', resumePath);
            const fullPath = path.join(__dirname, '../../uploads', resumePath);
            console.log('📁 Full path constructed:', fullPath);
            resumeText = await parseDocument(fullPath);
            console.log('✅ Resume parsed from file, length:', resumeText.length);
        } else {
            console.log('✅ Using provided resume text, length:', resumeText.length);
        }

        // Create AnalysisJob with status 'running'
        let analysisJob = null;
        if (profileId) {
            console.log('💾 Creating analysis job for profile:', profileId);
            analysisJob = await AnalysisJob.create({
                profileId: profileId,
                status: 'running',
                result: null,
                error: null,
            });
            console.log(`✅ Analysis job created with ID: ${analysisJob.id}`);
        }

        console.log('🤖 Calling analyzeProfile with model:', model || 'default');
        const analysis = await analyzeProfile(resumeText, answers, model as ModelKey);
        console.log('✅ Analysis completed successfully');

        // Update AnalysisJob status to 'success'
        if (analysisJob) {
            await analysisJob.update({
                status: 'success',
                result: analysis,
            });
            console.log('✅ Analysis job updated to success');
        }

        // Save to Database
        // @ts-ignore - req.user is added by auth middleware
        const userId = req.user?.id;
        if (userId) {
            console.log('💾 Saving roadmap to database for user:', userId);
            await RoadmapProgress.create({
                userId,
                roadmapData: analysis,
                progress: []
            });
            console.log('✅ Roadmap saved to DB');
        } else {
            console.warn('⚠️ No user ID found, skipping DB save');
        }

        console.log('📊 Analysis result:', {
            gapsCount: analysis.gaps?.length || 0,
            roadmapItemsCount: analysis.roadmap?.length || 0
        });

        res.status(200).json(analysis);
        console.log('✅ Response sent to client');
    } catch (error) {
        console.error('❌ Error analyzing profile:', error);

        // Update AnalysisJob status to 'failed' if it exists
        const { profileId } = req.body;
        if (profileId) {
            try {
                const failedJob = await AnalysisJob.findOne({
                    where: { profileId, status: 'running' },
                    order: [['createdAt', 'DESC']]
                });
                if (failedJob) {
                    await failedJob.update({
                        status: 'failed',
                        error: error instanceof Error ? error.message : 'Unknown error',
                    });
                    console.log('✅ Analysis job marked as failed');
                }
            } catch (updateError) {
                console.error('❌ Failed to update job status:', updateError);
            }
        }

        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: 'Failed to generate analysis' });
    }
};

export const updateProfileBasedOnProgress = async (req: Request, res: Response) => {
    try {
        console.log('🔄 updateProfileBasedOnProgress called');
        const { id: roadmapId } = req.params;
        const { stepId, completed, progress } = req.body;
        // @ts-ignore
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        // Find the latest roadmap for the user
        const roadmapEntry = await RoadmapProgress.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        if (!roadmapEntry) {
            return res.status(404).json({ message: 'Roadmap not found' });
        }

        let currentAnalysis = roadmapEntry.roadmapData;
        if (typeof currentAnalysis === 'string') {
            try {
                currentAnalysis = JSON.parse(currentAnalysis);
            } catch (e) {
                console.error('❌ Failed to parse currentAnalysis JSON:', e);
                return res.status(500).json({ message: 'Data corruption error' });
            }
        }

        // Update progress in DB
        // Use the progress array from frontend if provided, otherwise build from stepId
        let currentProgress = progress || roadmapEntry.progress || [];

        if (!Array.isArray(currentProgress)) {
            currentProgress = [];
        }

        // If stepId is provided, ensure it's in the progress array
        if (stepId) {
            if (completed) {
                // Add if not exists
                if (!currentProgress.some((p: any) => p === stepId || p.stepId === stepId)) {
                    currentProgress.push(stepId);
                }
            } else {
                // Remove
                currentProgress = currentProgress.filter((p: any) => p !== stepId && p.stepId !== stepId);
            }
        }

        // Update the entry
        await roadmapEntry.update({ progress: currentProgress });
        console.log('✅ Progress updated in DB');

        // Now calculate the profile update using the deterministic function
        // Extract the steps array from roadmap (it might be roadmap.steps or roadmap itself if it's already an array)
        const roadmapSteps = Array.isArray(currentAnalysis.roadmap)
            ? currentAnalysis.roadmap
            : (currentAnalysis.roadmap?.steps || []);

        console.log('🔍 DEBUG: roadmapSteps type:', typeof roadmapSteps, 'isArray:', Array.isArray(roadmapSteps), 'length:', roadmapSteps?.length);
        console.log('🔍 DEBUG: roadmapSteps value:', JSON.stringify(roadmapSteps).substring(0, 200));

        const updatedProfile = updateProfileWithCode(
            currentAnalysis, // Pass the whole analysis object which contains classification/assessment
            roadmapSteps,
            currentProgress
        );

        // Update the stored roadmap data with the new classification/assessment
        const updatedAnalysis = {
            ...currentAnalysis,
            classification: updatedProfile.classification,
            assessment: updatedProfile.assessment
        };

        await roadmapEntry.update({ roadmapData: updatedAnalysis });
        console.log('✅ Roadmap data (profile) updated in DB');

        res.status(200).json({
            message: 'Profile updated successfully',
            classification: updatedProfile.classification,
            assessment: updatedProfile.assessment,
            progress: currentProgress
        });
    } catch (error) {
        console.error('❌ Error updating profile:', error);
        res.status(500).json({ message: 'Failed to update profile' });
    }
};

export const getLatestRoadmap = async (req: Request, res: Response) => {
    try {
        console.log('📥 getLatestRoadmap called');
        // @ts-ignore
        const userId = req.user?.id;

        if (!userId) {
            return res.status(401).json({ message: 'User not authenticated' });
        }

        const roadmapEntry = await RoadmapProgress.findOne({
            where: { userId },
            order: [['createdAt', 'DESC']]
        });

        if (!roadmapEntry) {
            console.log('ℹ️ No roadmap found for user');
            return res.status(200).json(null); // Return null so frontend knows to redirect to start
        }

        console.log('✅ Roadmap found for user');

        let roadmapData = roadmapEntry.roadmapData;
        console.log('📦 Raw roadmapData type:', typeof roadmapData);

        if (typeof roadmapData === 'string') {
            try {
                console.log('⚠️ roadmapData is string, parsing...');
                roadmapData = JSON.parse(roadmapData);
            } catch (e) {
                console.error('❌ Failed to parse roadmapData JSON:', e);
                roadmapData = {};
            }
        }

        // Return the roadmap data merged with progress info if needed
        // The frontend expects the 'analysis' object structure
        const responseData = {
            ...roadmapData,
            id: roadmapEntry.id,
            progress: roadmapEntry.progress
        };

        res.status(200).json(responseData);
    } catch (error) {
        console.error('❌ Error fetching latest roadmap:', error);
        res.status(500).json({ message: 'Failed to fetch roadmap' });
    }
};
