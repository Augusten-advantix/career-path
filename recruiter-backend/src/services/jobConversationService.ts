import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

const MAX_QUESTIONS = 7;
const MIN_QUESTIONS = 5;

export const generateJobQuestion = async (conversationHistory: any[]) => {
    // Count answered questions
    const answeredQuestions = conversationHistory.filter(entry => entry.answer && entry.answer.trim());
    const questionNumber = answeredQuestions.length + 1;

    // Hard limit: Stop after MAX_QUESTIONS
    if (answeredQuestions.length >= MAX_QUESTIONS) {
        console.log(`✅ Reached maximum questions (${MAX_QUESTIONS}), marking as complete`);
        return {
            complete: true,
            message: "Thank you! I have all the information needed."
        };
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    // Build conversation context
    const conversationContext = answeredQuestions
        .map((entry, idx) => `Q${idx + 1}: ${entry.question}\nA${idx + 1}: ${entry.answer}`)
        .join('\n\n');

    const prompt = `
    You are an expert recruitment assistant helping a recruiter define job requirements through natural conversation.
    
    CONVERSATION SO FAR:
    ${conversationContext || 'This is the first question.'}
    
    CURRENT QUESTION: ${questionNumber} of ${MAX_QUESTIONS} maximum
    ANSWERED SO FAR: ${answeredQuestions.length}
    
    OBJECTIVE: Gather complete job requirements covering:
    - Job title and role level
    - Key responsibilities
    - Must-have technical skills
    - Nice-to-have skills  
    - Required experience level
    - Team context
    - Specific technologies
    
    RULES:
    1. Ask ONE clear, conversational question
    2. DON'T repeat already-covered topics
    3. Build naturally on previous answers
    4. Be friendly and professional
    
    ${answeredQuestions.length >= MIN_QUESTIONS ?
            'NOTE: You have enough questions. If you feel you have sufficient information, mark as complete.' :
            'NOTE: Continue gathering information.'}
    
    If you have sufficient information, respond:
    {"complete": true, "message": "Thank you! I have all the information needed."}
    
    Otherwise:
    {"complete": false, "question": "Your next question here"}
    
    Return ONLY valid JSON. NO MARKDOWN.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        console.log(`Question ${questionNumber}:`, parsed.complete ? 'COMPLETE' : parsed.question.substring(0, 80));

        return parsed;
    } catch (error) {
        console.error('Gemini Question Generation Error:', error);
        throw error;
    }
};

export const extractStructuredRequirements = async (conversationHistory: any[]) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const conversationContext = conversationHistory
        .filter(entry => entry.answer && entry.answer.trim())
        .map(entry => `Q: ${entry.question}\nA: ${entry.answer}`)
        .join('\n\n');

    const prompt = `
    Extract structured job requirements from this conversation with a recruiter:
    
    ${conversationContext}
    
    Return a JSON object with:
    {
        "jobTitle": "exact job title mentioned",
        "responsibilities": ["list of key responsibilities mentioned"],
        "mustHaveSkills": ["must-have technical skills and tools"],
        "niceToHaveSkills": ["nice-to-have additional skills"],
        "experienceLevel": "Junior/Mid/Senior or X years",
        "teamContext": "team size, reporting structure, work environment details",
        "techStack": ["specific technologies, frameworks, or tools mentioned"]
    }
    
    Be comprehensive - include all details mentioned in the conversation.
    Return ONLY valid JSON. NO MARKDOWN.
    `;

    try {
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Gemini Requirements Extraction Error:', error);
        throw error;
    }
};
