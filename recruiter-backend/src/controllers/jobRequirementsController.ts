import { Request, Response } from 'express';
import JobRequirements from '../models/JobRequirements';
import Upload from '../models/Upload';
import Profile from '../models/Profile';
import AnalysisJob from '../models/AnalysisJob';
import { generateJobQuestion, extractStructuredRequirements } from '../services/jobConversationService';

export const startConversation = async (req: Request, res: Response) => {
    try {
        const recruiterId = (req as any).user.id;

        // Check for an existing incomplete conversation to resume
        const existingIncomplete = await JobRequirements.findOne({
            where: { recruiterId, isComplete: false },
            order: [['createdAt', 'DESC']]
        });

        if (existingIncomplete) {
            const history = existingIncomplete.conversationHistory || [];
            const lastEntry = history[history.length - 1];
            // If the last entry has an answer, we need to generate the next question (this shouldn't happen if flow is correct, but safe to handle)
            // Actually, if we just return the last question which is unanswered, that's fine.
            const questionToAsk = lastEntry?.answer ? "Let's continue. What else?" : lastEntry?.question;

            // If for some reason history is empty (shouldn't be), generate new
            if (!questionToAsk) {
                // Fallback to create new logic if corrupted
            } else {
                return res.json({
                    conversationId: existingIncomplete.id,
                    question: questionToAsk,
                    history: history, // Return full history
                    resumed: true
                });
            }
        }

        // Generate first question
        const firstQuestion = await generateJobQuestion([]);

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
        const { answer } = req.body;
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
        const nextQuestion = await generateJobQuestion(history);

        if (nextQuestion.complete) {
            // Extract structured requirements
            const structured = await extractStructuredRequirements(history);

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
            where: { recruiterId },
            order: [['createdAt', 'DESC']]
        });

        res.json(requirements);
    } catch (error: any) {
        console.error('Get requirements error:', error);
        res.status(500).json({ error: error.message });
    }
};

export const deleteRequirement = async (req: Request, res: Response) => {
    try {
        const recruiterId = (req as any).user.id;
        const { id } = req.params;

        const reqRecord = await JobRequirements.findOne({ where: { id, recruiterId } });
        if (!reqRecord) return res.status(404).json({ error: 'Job requirement not found' });

        // Unlink uploads that referenced this job requirement (we don't delete uploads to avoid data loss)
        await Upload.update({ jobRequirementId: null }, { where: { jobRequirementId: id } });

        // Delete the job requirement
        await reqRecord.destroy();

        res.json({ message: 'Job requirement deleted' });
    } catch (error) {
        console.error('Delete job requirement error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
};
