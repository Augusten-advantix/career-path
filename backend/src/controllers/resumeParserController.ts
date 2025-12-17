import { Request, Response } from 'express';
import { parseResumeWithAI } from '../services/resumeParserService';

/**
 * POST /api/resume/parse
 * Parse resume text into structured sections using AI
 */
export const parseResume = async (req: Request, res: Response) => {
    try {
        console.log('📄 Parse resume endpoint called');
        const { resumeText } = req.body;

        if (!resumeText || typeof resumeText !== 'string') {
            return res.status(400).json({ message: 'Resume text is required' });
        }

        console.log('📝 Parsing resume text...');
        const parsedData = await parseResumeWithAI(resumeText);

        console.log('✅ Resume parsed successfully');
        res.status(200).json(parsedData);
    } catch (error) {
        console.error('❌ Error in parseResume controller:', error);
        res.status(500).json({ message: 'Failed to parse resume' });
    }
};
