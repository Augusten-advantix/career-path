import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

export const analyzeProfileBatch = async (profiles: any[], jobRequirements?: any) => {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const requirementsSection = jobRequirements ? `
    JOB REQUIREMENTS (from recruiter conversation):
    - Job Title: ${jobRequirements.jobTitle}
    - Required Experience: ${jobRequirements.experienceLevel}
    - Key Responsibilities: ${jobRequirements.responsibilities?.join(', ')}
    - Must-Have Skills: ${jobRequirements.mustHaveSkills?.join(', ')}
    - Nice-to-Have Skills: ${jobRequirements.niceToHaveSkills?.join(', ')}
    - Tech Stack: ${jobRequirements.techStack?.join(', ')}
    - Team Context: ${jobRequirements.teamContext}
    ` : 'No specific job requirements provided. Analyze for general Software Engineer fit.';

        const prompt = `
        You are an expert technical recruiter. Analyze and STRUCTURE the following candidate profiles AGAINST the specific job requirements.
    
        ${requirementsSection}
    
        Candidate Profiles (each object will contain 'resumeText' with plain text):
        ${JSON.stringify(profiles, null, 2)}
    
        For EACH profile, return a JSON object with the following structure:
        {
            "id": <profile id>,
            "structured_profile": {
                    "name": "Full name or null",
                    "title": "Current or most recent title",
                    "yearsExperience": number or null,
                    "location": "Location or null",
                    "education": ["degree / institution"],
                    "skills": ["list of important skills"],
                    "emails": ["email addresses found"],
                    "phones": ["phone numbers found"],
                    "summary": "Short 1-sentence summary of the candidate"
            },
            "analysis": {
                "match_score": number from 0-100,
                "strengths": ["top 3 strengths"],
                "weaknesses": ["top 3 weaknesses"],
                "gaps": [{"type":"skill|experience|knowledge","description":"","severity":"high|medium|low","confidence":0-100}],
                "one_solution": "Single actionable recommendation",
                "match_reasons": "Brief explanation (Explain why the candidate matches or not based on MUST-HAVE skills, experience, responsibilities and nice-to-have)"
            }
        }

        IMPORTANT: The "structured_profile" must be extracted from the resume text accurately.
        IMPORTANT: Base your match_score primarily on 60% must-have skills, 20% experience, 15% responsibilities, 5% nice-to-have.
        Return a JSON ARRAY containing one object for each profile.
        Return ONLY THE JSON ARRAY. NO MARKDOWN.
        `;

    try {
        console.log('Generating content with Gemini...');
        const result = await model.generateContent(prompt);
        console.log('Gemini response received. Getting text...');
        const response = await result.response;
        const text = response.text();
        console.log('Raw Gemini text length:', text.length);

        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        return JSON.parse(cleanText);
    } catch (error) {
        console.error('Gemini Batch Analysis Error:', error);
        throw error;
    }
};
