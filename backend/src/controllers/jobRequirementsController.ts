import { Request, Response } from 'express';
import JobRequirements from '../models/JobRequirements';
import Upload from '../models/Upload';
import Profile from '../models/Profile';
import AnalysisJob from '../models/AnalysisJob';
import { generateJobQuestion, extractStructuredRequirements } from '../services/jobConversationService';

export const startConversation = async (req: Request, res: Response) => {
    try {
        const recruiterId = (req as any).user.id;

        // Delete previous incomplete job requirements
        await JobRequirements.destroy({
            where: { recruiterId, isComplete: false }
        });

        // Get all uploads for this recruiter to find associated profiles
        const previousUploads = await Upload.findAll({
            where: { recruiterId }
        });

        // Delete in correct order to respect foreign key constraints
        if (previousUploads.length > 0) {
            const uploadIds = previousUploads.map(u => u.id);

            // 1. First delete AnalysisJobs that reference these profiles
            const profiles = await Profile.findAll({
                where: { uploadId: uploadIds }
            });

            if (profiles.length > 0) {
                const profileIds = profiles.map(p => p.id);
                await AnalysisJob.destroy({
                    where: { profileId: profileIds }
                });
            }

            // 2. Then delete profiles
            await Profile.destroy({
                where: { uploadId: uploadIds }
            });

            // 3. Finally delete uploads
            await Upload.destroy({
                where: { recruiterId }
            });
        }

        console.log(`✅ Cleaned up previous data for recruiter ${recruiterId}`);

        // Extract optional answers such as availableHoursPerWeek
        const { availableHoursPerWeek } = req.body || {};

        // Generate first question using optional answers (availability)
        const firstQuestion = await generateJobQuestion([], { availableHoursPerWeek });

        // Create new conversation with first question in history
        const jobReq = await JobRequirements.create({
            recruiterId,
            conversationHistory: [{
                question: firstQuestion.question,
                answer: null
            }],
            isComplete: false
        });

        res.json({
            conversationId: jobReq.id,
            question: firstQuestion.question
        });
    } catch (error: any) {
        console.error('Start conversation error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const submitAnswer = async (req: Request, res: Response) => {
    try {
        const { conversationId } = req.params;
        const { answer, availableHoursPerWeek } = req.body;
        const recruiterId = (req as any).user.id;

        const jobReq = await JobRequirements.findOne({
            where: { id: conversationId, recruiterId }
        });

        if (!jobReq) {
            return res.status(404).json({ error: 'Conversation not found' });
        }

        // Deep clone history to avoid mutation issues
        const history = JSON.parse(JSON.stringify(jobReq.conversationHistory || []));

        // Update the last question's answer
        if (history.length > 0) {
            history[history.length - 1].answer = answer;
        }

        console.log('Answered questions:', history.filter((h: any) => h.answer).length);

        // Generate next question
        const nextQuestion = await generateJobQuestion(history, { availableHoursPerWeek });

        if (nextQuestion.complete) {
            // Extract structured requirements
            const structured = await extractStructuredRequirements(history);

            // Attach recruiter-supplied availability to the structured results if provided
            if (availableHoursPerWeek) {
                structured.assumptions = structured.assumptions || {};
                structured.assumptions.availableHoursPerWeek = Number(availableHoursPerWeek);
            }

            await jobReq.update({
                conversationHistory: history,
                structuredRequirements: structured,
                isComplete: true
            });

            return res.json({
                complete: true,
                message: nextQuestion.message,
                requirements: structured
            });
        }

        // Add new question to history
        history.push({
            question: nextQuestion.question,
            answer: null
        });

        await jobReq.update({
            conversationHistory: history
        });

        res.json({
            complete: false,
            question: nextQuestion.question,
            progress: history.filter((h: any) => h.answer).length
        });
    } catch (error: any) {
        console.error('Submit answer error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getRequirements = async (req: Request, res: Response) => {
    try {
        const recruiterId = (req as any).user.id;

        const requirements = await JobRequirements.findAll({
            where: { recruiterId, isComplete: true },
            order: [['createdAt', 'DESC']]
        });

        res.json(requirements);
    } catch (error: any) {
        console.error('Get requirements error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const getJobRequirementsById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const recruiterId = (req as any).user.id;

        const requirement = await JobRequirements.findOne({
            where: { id, recruiterId }
        });

        if (!requirement) {
            return res.status(404).json({ error: 'Job requirements not found' });
        }

        res.json(requirement);
    } catch (error: any) {
        console.error('Get job requirement error:', error);
        res.status(500).json({ error: error.message });
    }
};
