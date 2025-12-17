import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export interface ParsedResumeData {
    name: string;
    contact: string;
    objective: string;
    technical: string;
    soft: string;
    education: string;
    experience: string;
    certifications: string;
    hobbies: string;
    languages: string;
}

/**
 * Parse resume text into structured sections using AI
 */
export const parseResumeWithAI = async (resumeText: string): Promise<ParsedResumeData> => {
    console.log('🤖 parseResumeWithAI called');
    console.log('📝 Resume text length:', resumeText.length);

    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const prompt = `
You are a resume parser. Extract and organize the following resume text into structured sections.

Resume Text:
${resumeText}

Your task: Parse this resume and extract information into the following sections. If a section is not present in the resume, return an empty string for that field.

CRITICAL INSTRUCTIONS:
1. Extract EXACTLY what is written in the resume for each section
2. Do NOT add, infer, or make up any information
3. Preserve the original wording and formatting
4. If multiple items exist in a section, keep them all
5. For contact info, extract: phone number, email, address (all on separate lines)

Return ONLY a JSON object in this exact format (no markdown, no code blocks):
{
  "name": "Full name of the person",
  "contact": "Phone number\\nEmail address\\nFull address",
  "objective": "Career objective or summary statement",
  "technical": "All technical skills listed (one per line or comma-separated)",
  "soft": "All soft skills listed (one per line or comma-separated)",
  "education": "All education entries with degree, institution, year",
  "experience": "All work experience with company, role, duration, responsibilities",
  "certifications": "All certifications with name, issuer, date",
  "hobbies": "Hobbies and interests",
  "languages": "Languages spoken with proficiency levels"
}

IMPORTANT: Return valid JSON only. Do not wrap in markdown code blocks.
    `.trim();

    try {
        console.log('📤 Sending parsing prompt to Gemini API...');
        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        console.log('✅ Gemini API response received');
        console.log('📝 Response length:', text.length);

        // Clean up potential markdown formatting
        const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleanText);

        console.log('✅ Resume parsed successfully');
        console.log('📊 Parsed sections:', Object.keys(parsed));

        return parsed as ParsedResumeData;
    } catch (error) {
        console.error('❌ Error parsing resume with AI:', error);
        throw new Error('Failed to parse resume');
    }
};
