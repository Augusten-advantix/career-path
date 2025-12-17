import { generateContent, ModelKey } from './llmProvider';
import { ResumeStructure } from './classificationService';

// Enhanced assessment types
export interface Strength {
  description: string;
  evidence: string[];
  impact: 'high' | 'medium' | 'low';
}

export interface Weakness {
  description: string;
  severity: 'critical' | 'important' | 'optional';
  impact: string;
  marketDemand: 'high' | 'medium' | 'low';
}

export interface Gap {
  id: string;
  type: 'skill' | 'experience' | 'certification' | 'education';
  description: string;
  severity: 'critical' | 'important' | 'optional';
  evidence: string;
  industryStandard: string;
  currentLevel: string;
  targetLevel: string;
}

export interface CompetitiveAnalysis {
  overallScore: number;  // 0-100
  comparedToPeers: 'below_average' | 'average' | 'above_average' | 'exceptional';
  marketReadiness: number;  // 0-100
  estimatedTimeToTarget: string;
}

export interface RoleRequirements {
  required: string[];
  preferred: string[];
  missing: string[];
  satisfied: string[];
}

export interface ProfileAssessment {
  classification: ResumeStructure;
  targetRole: {
    title: string;
    level: string;
    industry: string;
  };
  strengths: Strength[];
  weaknesses: Weakness[];
  gaps: Gap[];
  competitiveAnalysis: CompetitiveAnalysis;
  roleRequirements: RoleRequirements;
}

/**
 * Perform comprehensive assessment of user profile
 * Includes classification, strengths/weaknesses, gaps, and competitive analysis
 * @param modelKey - Optional model to use for generation
 */
export const assessProfile = async (
  classification: ResumeStructure,
  targetRole: string,
  answers: any,
  modelKey?: ModelKey
): Promise<ProfileAssessment> => {
  console.log('📊 assessProfile called');
  console.log('🎯 Target role:', targetRole);

  const prompt = `
You are a senior career coach and industry expert. Perform a comprehensive assessment of this candidate's profile.

CANDIDATE PROFILE (Structured):
${JSON.stringify(classification, null, 2)}

TARGET ROLE: ${targetRole}

QUESTIONNAIRE ANSWERS:
${JSON.stringify(answers, null, 2)}

Perform a detailed assessment covering:

1. STRENGTHS: What makes this candidate strong? What advantages do they have?
2. WEAKNESSES: What areas need improvement? What gaps exist?
3. GAPS: Specific skills, certifications, or experience missing for the target role
4. COMPETITIVE ANALYSIS: How do they compare to typical candidates for this role?
5. ROLE REQUIREMENTS: What's required vs what they have

Provide industry-specific insights based on current market standards for the target role.

Output JSON format (no markdown, no code blocks):
{
  "targetRole": {
    "title": "${targetRole}",
    "level": "Entry|Mid|Senior|Lead",
    "industry": "Industry name"
  },
  "strengths": [
    {
      "description": "What makes them strong",
      "evidence": ["Specific examples from their background"],
      "impact": "high|medium|low"
    }
  ],
  "weaknesses": [
    {
      "description": "Area needing improvement",
      "severity": "critical|important|optional",
      "impact": "Why this matters for the role",
      "marketDemand": "high|medium|low"
    }
  ],
  "gaps": [
    {
      "id": "unique_id",
      "type": "skill|experience|certification|education",
      "description": "What's missing",
      "severity": "critical|important|optional",
      "evidence": "Why this is a gap",
      "industryStandard": "What the industry typically requires",
      "currentLevel": "Where the candidate is now",
      "targetLevel": "Where they need to be"
    }
  ],
  "competitiveAnalysis": {
    "overallScore": 0-100,
    "comparedToPeers": "below_average|average|above_average|exceptional",
    "marketReadiness": 0-100,
    "estimatedTimeToTarget": "e.g., 3-6 months"
  },
  "roleRequirements": {
    "required": ["Must-have skills/qualifications"],
    "preferred": ["Nice-to-have skills"],
    "missing": ["Required items the candidate lacks"],
    "satisfied": ["Required items the candidate has"]
  }
}

Be honest and specific. Base your assessment on real industry standards.
  `.trim();

  try {
    console.log('📤 Sending assessment prompt to LLM API...');
    const text = await generateContent(prompt, modelKey);

    console.log('✅ Assessment response received');

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    const assessment: ProfileAssessment = {
      classification,
      ...parsed
    };

    console.log('✅ Profile assessment complete');
    console.log('📊 Assessment summary:', {
      strengths: assessment.strengths.length,
      weaknesses: assessment.weaknesses.length,
      gaps: assessment.gaps.length,
      overallScore: assessment.competitiveAnalysis.overallScore,
      marketReadiness: assessment.competitiveAnalysis.marketReadiness
    });

    return assessment;
  } catch (error) {
    console.error('❌ Error assessing profile:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to assess profile');
  }
};
