import { generateContent, ModelKey } from './llmProvider';


// Type definitions for structured resume data
export interface Skill {
  name: string;
  category: string;
  yearsOfExperience?: number;
  proficiencyLevel?: 'beginner' | 'intermediate' | 'advanced' | 'expert';
}

export interface WorkExperience {
  company: string;
  role: string;
  startDate?: string;
  endDate?: string;
  duration?: string;
  responsibilities?: string[];
}

export interface Education {
  institution: string;
  degree: string;
  field?: string;
  graduationYear?: string;
}

export interface Certification {
  name: string;
  issuer: string;
  dateObtained?: string;
  expiryDate?: string;
}

export interface Project {
  name: string;
  description: string;
  technologies?: string[];
  role?: string;
}

export interface ResumeStructure {
  personalInfo: {
    name?: string;
    email?: string;
    phone?: string;
    location?: string;
    linkedin?: string;
    github?: string;
  };
  summary?: string;
  skills: {
    technical: Skill[];
    soft: Skill[];
    domain: Skill[];
  };
  experience: WorkExperience[];
  education: Education[];
  certifications: Certification[];
  projects: Project[];
  experienceLevel: 'entry' | 'mid' | 'senior' | 'lead' | 'unknown';
  totalYearsExperience: number;
  industryDomains: string[];
}

/**
 * Extract and categorize all information from resume text
 * Uses AI to parse unstructured text into structured JSON
 * @param resumeText - The resume text to parse
 * @param modelKey - Optional model to use for generation
 */
export const extractResumeStructure = async (resumeText: string, modelKey?: ModelKey): Promise<ResumeStructure> => {
  console.log('🔍 extractResumeStructure called');
  console.log('📝 Resume text length:', resumeText?.length || 0);

  const prompt = `
You are an expert resume parser. Analyze the following resume text and extract structured information.

Resume Text:
${resumeText}

Extract and categorize ALL information into the following JSON structure. Be thorough and accurate.

IMPORTANT GUIDELINES:
1. For skills:
   - Technical skills: programming languages, frameworks, tools, technologies
   - Soft skills: leadership, communication, teamwork, problem-solving, etc.
   - Domain skills: industry knowledge (e.g., healthcare, finance, e-commerce, AI/ML)
   
2. For experience level, determine based on:
   - Total years of experience
   - Job titles and responsibilities
   - Entry: 0-2 years
   - Mid: 2-5 years
   - Senior: 5-10 years
   - Lead: 10+ years or leadership roles
   
3. Calculate total years of experience from work history

4. Identify industry domains from work experience and projects

5. Extract proficiency level for skills when mentioned (beginner/intermediate/advanced/expert)

Output JSON format (no markdown, no code blocks):
{
  "personalInfo": {
    "name": "string or null",
    "email": "string or null",
    "phone": "string or null",
    "location": "string or null",
    "linkedin": "string or null",
    "github": "string or null"
  },
  "summary": "Professional summary or objective if present, otherwise null",
  "skills": {
    "technical": [
      {
        "name": "Skill name",
        "category": "Category like 'Programming Language', 'Framework', 'Tool'",
        "yearsOfExperience": number or null,
        "proficiencyLevel": "beginner|intermediate|advanced|expert or null"
      }
    ],
    "soft": [
      {
        "name": "Soft skill name",
        "category": "Category like 'Leadership', 'Communication'",
        "proficiencyLevel": "beginner|intermediate|advanced|expert or null"
      }
    ],
    "domain": [
      {
        "name": "Domain knowledge like 'Healthcare', 'FinTech'",
        "category": "Industry domain",
        "yearsOfExperience": number or null
      }
    ]
  },
  "experience": [
    {
      "company": "Company name",
      "role": "Job title",
      "startDate": "Start date if available",
      "endDate": "End date or 'Present'",
      "duration": "Duration like '2 years 3 months'",
      "responsibilities": ["List of key responsibilities"]
    }
  ],
  "education": [
    {
      "institution": "School/University name",
      "degree": "Degree type (BS, MS, PhD, etc.)",
      "field": "Field of study",
      "graduationYear": "Year or null"
    }
  ],
  "certifications": [
    {
      "name": "Certification name",
      "issuer": "Issuing organization",
      "dateObtained": "Date or null",
      "expiryDate": "Expiry date or null"
    }
  ],
  "projects": [
    {
      "name": "Project name",
      "description": "Brief description",
      "technologies": ["Technologies used"],
      "role": "Role in project"
    }
  ],
  "experienceLevel": "entry|mid|senior|lead|unknown",
  "totalYearsExperience": number,
  "industryDomains": ["List of industries worked in"]
}

Be as complete as possible. If information is not available, use null or empty arrays.
  `.trim();

  try {
    // Helper function to safely parse JSON from LLM response
    const safeParseJSON = (rawText: string): ResumeStructure => {
      console.log('🔧 Starting JSON cleanup...');

      // Step 1: Remove markdown code blocks
      let cleanText = rawText
        .replace(/```json\s*/gi, '')
        .replace(/```\s*/g, '')
        .trim();

      console.log('🔧 After markdown removal, length:', cleanText.length);

      // Step 2: Try standard JSON.parse first
      try {
        const result = JSON.parse(cleanText);
        console.log('✅ JSON parsed successfully with standard JSON.parse');
        return result;
      } catch (e1: any) {
        console.warn('⚠️ Standard parse failed, trying jsonrepair:', e1.message);
        console.log('📝 Text to repair (first 500 chars):', cleanText.substring(0, 500));

        // Step 3: Use jsonrepair to fix malformed JSON
        try {
          const { jsonrepair } = require('jsonrepair');
          const repairedText = jsonrepair(cleanText);
          const result = JSON.parse(repairedText);
          console.log('✅ JSON parsed successfully with jsonrepair');
          return result;
        } catch (e2: any) {
          console.error('❌ jsonrepair failed:', e2.message);

          // Step 4: Fallback - Extract generic JSON object if jsonrepair fails on full text
          try {
            const firstBrace = cleanText.indexOf('{');
            const lastBrace = cleanText.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace > firstBrace) {
              const extracted = cleanText.substring(firstBrace, lastBrace + 1);
              const { jsonrepair } = require('jsonrepair');
              const repairedExtracted = jsonrepair(extracted);
              const result = JSON.parse(repairedExtracted);
              console.log('✅ JSON parsed after extraction and repair');
              return result;
            }
          } catch (e3: any) {
            console.error('❌ Extraction + repair failed:', e3.message);
          }

          console.error('📝 Failed JSON (first 500 chars):', cleanText.substring(0, 500));
          throw new Error(`Failed to parse LLM response. The model returned malformed JSON that could not be repaired.`);
        }
      }
    };

    let parsed: ResumeStructure | undefined;
    let attempts = 0;
    const MAX_RETRIES = 3;
    let lastError;

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        console.log(`🔄 Attempt ${attempts}/${MAX_RETRIES} calling LLM with model: ${modelKey || 'default'}`);
        console.log('📤 Sending classification prompt to LLM API...');
        const text = await generateContent(prompt, modelKey);
        console.log('✅ LLM API response received');
        console.log('📝 Raw response length:', text.length);

        parsed = safeParseJSON(text);
        break; // Success
      } catch (error: any) {
        console.warn(`⚠️ Attempt ${attempts} failed to generate valid JSON:`, error.message);
        lastError = error;

        if (attempts < MAX_RETRIES) {
          console.log(`⏳ Retrying with same model in 1 second...`);
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }
    }

    if (!parsed) {
      console.error('❌ All 3 attempts failed for model:', modelKey);

      // Automatic fallback to Gemini if parsing fails and we aren't already using Gemini
      if (modelKey !== 'gemini') {
        console.warn('⚠️ Automatically falling back to Official Gemini API (gemini-2.0-flash) for recovery...');
        return extractResumeStructure(resumeText, 'gemini');
      }

      throw lastError || new Error('Failed to extract resume structure after multiple retries');
    }

    console.log('✅ Resume structure parsed successfully');
    console.log('📊 Extracted data summary:', {
      technicalSkills: parsed.skills.technical.length,
      softSkills: parsed.skills.soft.length,
      domainSkills: parsed.skills.domain.length,
      workExperience: parsed.experience.length,
      education: parsed.education.length,
      certifications: parsed.certifications.length,
      projects: parsed.projects.length,
      experienceLevel: parsed.experienceLevel,
      totalYears: parsed.totalYearsExperience
    });

    return parsed;
  } catch (error) {
    console.error('❌ Error extracting resume structure:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to extract resume structure');
  }
};

/**
 * Get a summary of extracted classification for display
 */
export const getClassificationSummary = (structure: ResumeStructure): string => {
  const totalSkills =
    structure.skills.technical.length +
    structure.skills.soft.length +
    structure.skills.domain.length;

  return `
Classification Summary:
- Experience Level: ${structure.experienceLevel.toUpperCase()}
- Total Years: ${structure.totalYearsExperience}
- Skills: ${totalSkills} (${structure.skills.technical.length} technical, ${structure.skills.soft.length} soft, ${structure.skills.domain.length} domain)
- Work Experience: ${structure.experience.length} positions
- Education: ${structure.education.length} degrees
- Certifications: ${structure.certifications.length}
- projects: ${structure.projects.length}
- Industries: ${structure.industryDomains.join(', ') || 'Not specified'}
  `.trim();
};
