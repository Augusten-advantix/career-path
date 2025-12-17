import { Request, Response } from 'express';
import { generateFirstQuestion, generateNextQuestion, Message } from '../services/conversationService';
import { ModelKey } from '../services/llmProvider';

/**
 * POST /api/conversation/start
 * Starts a new conversation by generating the first question based on resume
 */
export const startConversation = async (req: Request, res: Response) => {
    try {
        console.log('🚀 startConversation called');
        const { resumeText, answers, model } = req.body;

        if (!resumeText) {
            console.error('❌ No resume text provided');
            return res.status(400).json({ message: 'Resume text is required to start conversation' });
        }

        console.log('📝 Resume text length:', resumeText.length);
        console.log('🤖 Using model:', model || 'default');

        const questionResponse = await generateFirstQuestion(resumeText, answers, model as ModelKey);

        console.log('✅ First question generated:', questionResponse.question);
        res.status(200).json(questionResponse);
    } catch (error) {
        console.error('❌ Error starting conversation:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
        res.status(500).json({ message: 'Failed to start conversation' });
    }
};

/**
 * POST /api/conversation/next
 * Generates the next question based on conversation history
 */
export const getNextQuestion = async (req: Request, res: Response) => {
    try {
        console.log('🚀 getNextQuestion called');
        const { resumeText, conversationHistory, answers, model } = req.body;

        if (!resumeText || !conversationHistory) {
            console.error('❌ Missing required fields');
            return res.status(400).json({
                message: 'Resume text and conversation history are required'
            });
        }

        console.log('📋 Conversation history length:', conversationHistory.length);
        console.log('🤖 Using model:', model || 'default');

        // Convert timestamp strings back to Date objects
        const history: Message[] = conversationHistory.map((msg: any) => ({
            role: msg.role,
            content: msg.content,
            timestamp: new Date(msg.timestamp)
        }));

        const questionResponse = await generateNextQuestion(resumeText, history, answers, model as ModelKey);

        if (questionResponse.isLastQuestion) {
            console.log('✅ Conversation complete');
        } else {
            console.log('✅ Next question generated:', questionResponse.question);
        }

        res.status(200).json(questionResponse);
    } catch (error) {
        console.error('❌ Error generating next question:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
        }
        res.status(500).json({ message: 'Failed to generate next question' });
    }
};

