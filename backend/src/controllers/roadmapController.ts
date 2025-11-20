import { Request, Response } from 'express';
import { analyzeProfile } from '../services/llm';
import { parseDocument } from '../services/parser';
import path from 'path';

export const analyzeCareerPath = async (req: Request, res: Response) => {
    try {
        console.log('🚀 analyzeCareerPath called');
        const { answers, resumePath, resumeText: providedText } = req.body;

        console.log('📋 Request body:', {
            hasAnswers: !!answers,
            answersCount: answers ? Object.keys(answers).length : 0,
            resumePath: resumePath,
            hasResumeText: !!providedText,
            resumeTextLength: providedText ? providedText.length : 0
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

        console.log('🤖 Calling analyzeProfile with Gemini API...');
        const analysis = await analyzeProfile(resumeText, answers);
        console.log('✅ Analysis completed successfully');
        console.log('📊 Analysis result:', {
            gapsCount: analysis.gaps?.length || 0,
            roadmapItemsCount: analysis.roadmap?.length || 0
        });

        res.status(200).json(analysis);
        console.log('✅ Response sent to client');
    } catch (error) {
        console.error('❌ Error analyzing profile:', error);
        if (error instanceof Error) {
            console.error('Error message:', error.message);
            console.error('Error stack:', error.stack);
        }
        res.status(500).json({ message: 'Failed to generate analysis' });
    }
};
