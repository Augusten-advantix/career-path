import { generateContent, ModelKey } from './llmProvider';
import { ProfileAssessment } from './assessmentService';

// Recommendation types
export interface Course {
  name: string;
  provider: string;
  url: string;
  duration: string;
  cost: { amount: number; currency: string } | 'free';
  rating?: number;
  difficulty: 'beginner' | 'intermediate' | 'advanced';
}

export interface Book {
  title: string;
  author: string;
  isbn?: string;
  amazonUrl?: string;
  cost: { amount: number; currency: string };
}

export interface ProjectIdea {
  title: string;
  description: string;
  githubTemplate?: string;
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedHours: number;
}

export interface Community {
  name: string;
  platform: string;
  url: string;
  memberCount?: number;
  activity: 'low' | 'medium' | 'high';
}

export interface Tool {
  name: string;
  purpose: string;
  url: string;
  cost: 'free' | 'freemium' | 'paid';
}

export interface RoadmapStep {
  id: string;
  title: string;
  description: string;
  category: 'learn' | 'project' | 'certification' | 'networking' | 'experience';
  priority: 1 | 2 | 3 | 4 | 5;
  suggested_timeframe: string;
  deadline_days: number;
  resources: {
    courses: Course[];
    books: Book[];
    projects: ProjectIdea[];
    communities: Community[];
    tools: Tool[];
  };
  successCriteria: string[];
  prerequisites: string[];
  estimatedCost: {
    min: number;
    max: number;
    currency: string;
    freeAlternatives: boolean;
  };
}

export interface EnhancedRoadmap {
  summary: {
    totalSteps: number;
    estimatedDuration: string;
    estimatedCost: { min: number; max: number; currency: string };
  };
  steps: RoadmapStep[];
}

/**
 * Generate enhanced roadmap with specific resources and recommendations
 * @param modelKey - Optional model to use for generation
 */
export const generateEnhancedRoadmap = async (
  assessment: ProfileAssessment,
  modelKey?: ModelKey
): Promise<EnhancedRoadmap> => {
  console.log('🗺️ generateEnhancedRoadmap called');

  const prompt = `
You are an expert career advisor. Based on this comprehensive profile assessment, create a detailed, actionable learning roadmap.

PROFILE ASSESSMENT:
${JSON.stringify(assessment, null, 2)}

Create a step-by-step roadmap to help this person reach their target role: ${assessment.targetRole.title}

CRITICAL REQUIREMENTS:
1. Provide SPECIFIC course recommendations with:
   - Actual course names (e.g., "AWS Certified Solutions Architect Associate" not "Cloud computing course")
   - Real providers (Coursera, Udemy, LinkedIn Learning, Pluralsight, edX, etc.)
   - Realistic URLs (use actual platform URLs when possible)
   - Accurate cost estimates or mark as "free"
   
2. Suggest REAL books with:
   - Full titles and authors
   - Amazon URLs or ISBNs when applicable
   - Actual prices

3. Provide SPECIFIC project ideas:
   - Concrete project names with descriptions
   - GitHub template URLs when available
   - Realistic time estimates

4. Recommend REAL communities:
   - Specific Discord servers, Slack groups, Reddit communities, LinkedIn groups
   - Actual URLs when possible

5. Include success criteria for each step
6. Show dependencies between steps (prerequisites)
7. Estimate costs (with free alternatives)

Focus on addressing the CRITICAL and IMPORTANT gaps first, then optional ones.

Output JSON format (no markdown, no code blocks):
{
  "summary": {
    "totalSteps": number,
    "estimatedDuration": "e.g., 6-9 months",
    "estimatedCost": { "min": number, "max": number, "currency": "USD" }
  },
  "steps": [
    {
      "id": "step_1",
      "title": "Specific actionable title",
      "description": "Detailed description of what to do",
      "category": "learn|project|certification|networking|experience",
      "priority": 1-5,
      "suggested_timeframe": "e.g., 2 months",
      "deadline_days": number,
      "resources": {
        "courses": [
          {
            "name": "Specific course name",
            "provider": "Coursera|Udemy|LinkedIn Learning|etc.",
            "url": "Actual URL or generic platform URL",
            "duration": "e.g., 40 hours",
            "cost": { "amount": number, "currency": "USD" } or "free",
            "rating": 4.5,
            "difficulty": "beginner|intermediate|advanced"
          }
        ],
        "books": [
          {
            "title": "Actual book title",
            "author": "Author name",
            "isbn": "ISBN if known",
            "amazonUrl": "URL or null",
            "cost": { "amount": number, "currency": "USD" }
          }
        ],
        "projects": [
          {
            "title": "Specific project name",
            "description": "What to build",
            "githubTemplate": "URL or null",
            "complexity": "simple|moderate|complex",
            "estimatedHours": number
          }
        ],
        "communities": [
          {
            "name": "Specific community name",
            "platform": "Discord|Slack|Reddit|LinkedIn",
            "url": "URL or general platform",
            "memberCount": number or null,
            "activity": "low|medium|high"
          }
        ],
        "tools": [
          {
            "name": "Tool name",
            "purpose": "What it's for",
            "url": "URL",
            "cost": "free|freemium|paid"
          }
        ]
      },
      "successCriteria": [
        "Measurable success criterion 1",
        "Measurable success criterion 2"
      ],
      "prerequisites": ["step_id_if_any"],
      "estimatedCost": {
        "min": number,
        "max": number,
        "currency": "USD",
        "freeAlternatives": true|false
      }
    }
  ]
}

EXAMPLES OF SPECIFICITY:
❌ BAD: "Take a cloud computing course"
✅ GOOD: "AWS Certified Solutions Architect Associate" from "A Cloud Guru" or "Udemy"

❌ BAD: "Read about system design"
✅ GOOD: "Designing Data-Intensive Applications" by Martin Kleppmann

❌ BAD: "Build a web app"
✅ GOOD: "Build a full-stack task management app with React, Node.js, and PostgreSQL"

Be as specific as possible while being realistic and helpful.
  `.trim();

  try {
    console.log('📤 Sending roadmap generation prompt to LLM API...');
    const text = await generateContent(prompt, modelKey);

    console.log('✅ Roadmap response received');

    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const roadmap: EnhancedRoadmap = JSON.parse(cleanText);

    console.log('✅ Enhanced roadmap generated');
    console.log('📊 Roadmap summary:', {
      totalSteps: roadmap.steps.length,
      duration: roadmap.summary.estimatedDuration,
      estimatedCost: `$${roadmap.summary.estimatedCost.min}-$${roadmap.summary.estimatedCost.max}`
    });

    return roadmap;
  } catch (error) {
    console.error('❌ Error generating enhanced roadmap:', error);
    if (error instanceof Error) {
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to generate enhanced roadmap');
  }
};

/**
 * Get roadmap cost summary
 */
export const getRoadmapCostSummary = (roadmap: EnhancedRoadmap): string => {
  const totalMin = roadmap.summary.estimatedCost.min;
  const totalMax = roadmap.summary.estimatedCost.max;
  const currency = roadmap.summary.estimatedCost.currency;

  const freeSteps = roadmap.steps.filter(s => s.estimatedCost.freeAlternatives).length;
  const paidSteps = roadmap.steps.length - freeSteps;

  return `
Cost Summary:
- Total Estimated Cost: ${currency} ${totalMin} - ${totalMax}
- Duration: ${roadmap.summary.estimatedDuration}
- Steps with Free Alternatives: ${freeSteps}/${roadmap.steps.length}
- Paid Steps: ${paidSteps}/${roadmap.steps.length}
  `.trim();
};
