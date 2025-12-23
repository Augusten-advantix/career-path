import { Request, Response } from 'express';
import { parseResumeWithAI } from '../services/resumeParserService';
import Profile from '../models/Profile';

interface AuthRequest extends Request {
    user?: any;
}

/**
 * POST /api/resume/parse
 * Parse resume text into structured sections using AI and save to database
 */
export const parseResume = async (req: AuthRequest, res: Response) => {
    try {
        console.log('📄 Parse resume endpoint called');
        const { resumeText } = req.body;
        const userId = req.user?.id;

        if (!resumeText || typeof resumeText !== 'string') {
            return res.status(400).json({ message: 'Resume text is required' });
        }

        console.log('📝 Parsing resume text...');
        const parsedData = await parseResumeWithAI(resumeText);

        // Save parsed profile to database
        console.log('💾 Saving profile to database...');

        // Extract skills from technical and soft skills sections
        const technicalSkills = parsedData.technical ? parsedData.technical.split(/[,\n]/).map(s => s.trim()).filter(s => s) : [];
        const softSkills = parsedData.soft ? parsedData.soft.split(/[,\n]/).map(s => s.trim()).filter(s => s) : [];
        const allSkills = [...technicalSkills, ...softSkills];

        // Extract basic info from experience section (simplified)
        const experienceLines = parsedData.experience ? parsedData.experience.split('\n') : [];
        const firstJobLine = experienceLines[0] || '';

        const profile = await Profile.create({
            userId: userId || null,
            uploadId: null, // Not using uploads table yet
            name: parsedData.name || 'Unknown',
            title: firstJobLine.split(',')[0]?.trim() || 'Not specified', // Extract from first experience line
            company: firstJobLine.includes(',') ? firstJobLine.split(',')[1]?.trim() : 'N/A',
            yearsExperience: 0, // TODO: Calculate from experience section
            skills: allSkills,
            extractedSnippets: {
                contact: parsedData.contact,
                objective: parsedData.objective,
                technical: parsedData.technical,
                soft: parsedData.soft,
                education: parsedData.education,
                experience: parsedData.experience,
                certifications: parsedData.certifications,
                hobbies: parsedData.hobbies,
                languages: parsedData.languages,
            },
            parseConfidence: 0.8, // Default confidence score
            analysis: null,
        });

        console.log(`✅ Profile saved with ID: ${profile.id}`);
        console.log('✅ Resume parsed successfully');

        res.status(200).json({
            ...parsedData,
            profileId: profile.id,
        });
    } catch (error) {
        console.error('❌ Error in parseResume controller:', error);
        res.status(500).json({ message: 'Failed to parse resume' });
    }
};
