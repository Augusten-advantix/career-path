import { generateNextQuestion as generateLLMQuestion } from './llm';
import { ModelKey } from './llmProvider';

export interface Message {
    role: 'assistant' | 'user';
    content: string;
    timestamp: Date;
}

export interface QuestionResponse {
    question: string;
    questionNumber: number;
    isLastQuestion: boolean;
}

const MIN_QUESTIONS = 5;
const MAX_QUESTIONS = 7;

/**
 * Generates the first question based on resume analysis
 */
export const generateFirstQuestion = async (resumeText: string, answers?: any, modelKey?: ModelKey): Promise<QuestionResponse> => {
    console.log('🚀 Generating first question based on resume');

    const context = {
        resumeText,
        conversationHistory: [],
        isFirstQuestion: true,
        answers,
        modelKey
    };

    const result = await generateLLMQuestion(context);

    return {
        question: result.question,
        questionNumber: 1,
        isLastQuestion: false
    };
};

/**
 * Generates the next question based on conversation history
 */
export const generateNextQuestion = async (
    resumeText: string,
    conversationHistory: Message[],
    answers?: any,
    modelKey?: ModelKey
): Promise<QuestionResponse> => {
    console.log('🚀 Generating next question, current history length:', conversationHistory.length);

    const questionNumber = Math.floor(conversationHistory.length / 2) + 1;
    const shouldEnd = shouldEndConversation(conversationHistory);

    if (shouldEnd) {
        console.log('✅ Conversation complete, enough context gathered');
        return {
            question: '',
            questionNumber,
            isLastQuestion: true
        };
    }

    const context = {
        resumeText,
        conversationHistory,
        isFirstQuestion: false,
        questionNumber,
        answers,
        modelKey
    };

    const result = await generateLLMQuestion(context);

    // Check if we've reached max questions
    const isLast = questionNumber >= MAX_QUESTIONS;

    return {
        question: result.question,
        questionNumber,
        isLastQuestion: isLast
    };
};

/**
 * Determines if the conversation should end
 * Criteria: At least MIN_QUESTIONS asked, and we have sufficient context
 */
export const shouldEndConversation = (conversationHistory: Message[]): boolean => {
    // Count only user messages (answers)
    const userAnswers = conversationHistory.filter(msg => msg.role === 'user');
    const numQuestions = userAnswers.length;

    console.log('📊 Conversation check - Questions answered:', numQuestions);

    // Must ask at least MIN_QUESTIONS
    if (numQuestions < MIN_QUESTIONS) {
        return false;
    }

    // If we've reached MAX_QUESTIONS, end it
    if (numQuestions >= MAX_QUESTIONS) {
        return true;
    }

    // Between MIN and MAX, we could add logic to check if we have enough context
    // For now, we'll let it go to MAX_QUESTIONS for thorough analysis
    return false;
};

/**
 * Extract structured answers from conversation history for analysis
 */
export const extractAnswersFromConversation = (conversationHistory: Message[]): Record<string, string> => {
    const answers: Record<string, string> = {};

    let currentQuestion = '';
    conversationHistory.forEach((msg, index) => {
        if (msg.role === 'assistant') {
            currentQuestion = msg.content;
        } else if (msg.role === 'user' && currentQuestion) {
            // Use question as key (or could use Q1, Q2, etc.)
            answers[`question_${Math.floor(index / 2) + 1}`] = msg.content;
        }
    });

    return answers;
};
