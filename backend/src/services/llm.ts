import { generateContent, ModelKey } from './llmProvider';

interface Message {
  role: 'assistant' | 'user';
  content: string;
  timestamp: Date;
}

interface QuestionGenerationContext {
  resumeText: string;
  conversationHistory: Message[];
  isFirstQuestion: boolean;
  questionNumber?: number;
  answers?: any;
  modelKey?: ModelKey;
}

export const analyzeProfile = async (profileText: string, answers: any, modelKey?: ModelKey): Promise<any> => {
  console.log('🤖 analyzeProfile called');
  console.log('📝 Profile text length:', profileText?.length || 0);
  console.log('📋 Answers:', answers);
  console.log('🤖 Using model:', modelKey || 'default');

  const prompt = `
You are an AI Career Development Coach. The user's resume and their questionnaire answers will be provided. Your job is to:

1. ANALYZE their current role and profession
2. IDENTIFY what AI knowledge is APPROPRIATE for their profession
3. Generate a roadmap for AI LITERACY and AI applications RELEVANT TO THEIR FIELD

**CRITICAL - ROLE-APPROPRIATE AI LEARNING**:

This is NOT about making everyone a data scientist or ML engineer. The goal is to help professionals understand and leverage AI IN THEIR SPECIFIC FIELD.

1. **NON-TECHNICAL ROLES** (Teachers, Nurses, Lawyers, HR, Sales, Managers, etc.):
   - DO NOT recommend: Python, Machine Learning, Deep Learning, TensorFlow, coding, certifications
   - INSTEAD recommend: AI literacy, understanding AI concepts, AI ethics, AI tools awareness for their field
   - Example for TEACHER:
     * "Understanding AI in Education" - How AI is transforming teaching
     * "AI Literacy Fundamentals" - What is AI, how it works at a high level
     * "AI-Assisted Teaching Concepts" - How AI can help with lesson planning, grading, personalization
     * "AI Ethics in Education" - Privacy, bias, appropriate use in classrooms
     * "Understanding AI Tools" - Awareness of AI tools available (NOT how to build them)

2. **SEMI-TECHNICAL ROLES** (Business Analysts, Product Managers, Marketing Analysts):
   - Light technical understanding without coding
   - AI concepts for decision making
   - Understanding AI capabilities and limitations

3. **TECHNICAL ROLES** (Developers, Data Scientists, Engineers):
   - CAN include technical AI skills
   - Programming, ML algorithms, frameworks

Inputs:
Resume:
${profileText}

Questionnaire Answers:
${JSON.stringify(answers, null, 2)}

ANALYSIS INSTRUCTIONS:
1. From the RESUME, identify: current role, profession type (technical vs non-technical), industry
2. DETERMINE: Is this a technical role that would benefit from learning Python/ML? Or a non-technical role that needs AI literacy?
3. Generate AI learning topics APPROPRIATE to their profession

ROADMAP RULES:
- MATCH learning topics to their profession
- For non-technical roles: Focus on AI understanding, not AI building
- NO course/platform recommendations - just topics to learn
- NO project recommendations
- Each step should explain WHAT to learn, not WHERE

**ROLE-SPECIFIC AI TOPICS**:

TEACHERS/EDUCATORS:
- AI Literacy Fundamentals (what is AI, how it works conceptually)
- AI in Education (personalized learning, tutoring, accessibility)
- AI Ethics for Educators (bias, privacy, student data)
- Evaluating AI Tools for Classroom Use
- Teaching Students About AI

HEALTHCARE PROFESSIONALS:
- AI in Healthcare Overview (diagnosis, treatment, admin)
- AI Ethics in Medicine (patient privacy, clinical decision support)
- Understanding Medical AI Applications
- AI Limitations and When Human Judgment is Critical

LEGAL PROFESSIONALS:
- AI in Legal Practice (research, contract analysis)
- AI Ethics and Legal Implications
- Understanding AI Bias and Fairness
- AI Regulation and Compliance

FINANCE/BUSINESS:
- AI in Business Decision Making
- Understanding AI Analytics and Predictions
- AI Risk and Limitations
- AI Strategy for Non-Technical Leaders

HR/RECRUITING:
- AI in Talent Acquisition
- AI Ethics in Hiring (bias, fairness)
- Understanding AI Screening Tools
- Human-AI Collaboration in HR

MARKETING/SALES:
- AI for Customer Insights
- Understanding AI Personalization
- AI in Content and Communications
- AI Analytics Fundamentals

TECHNICAL ROLES (Developers, Engineers, Data Scientists):
- Machine Learning Concepts
- Deep Learning Fundamentals
- Natural Language Processing
- Computer Vision
- AI/ML Best Practices



Return JSON with the following structure (return only JSON, no extra text):
{
  "classification": {
    "currentRole": "string",
    "yearsOfExperience": number,
    "primarySkills": ["string"],
    "aiSkillLevel": "Beginner" | "Intermediate" | "Advanced",
    "currentAiKnowledge": ["string (AI/ML topics they already know)"],
    "skills": {
      "technical": [{ "name": "string", "source": "resume" }],
      "soft": [{ "name": "string", "source": "resume" }],
      "domain": [{ "name": "string", "source": "resume" }],
      "ai": [{ "name": "string", "proficiency": "basic" | "intermediate" | "advanced", "source": "resume" | "answers" }]
    }
  },
  "assessment": {
    "targetRole": "string",
    "currentLevel": "Junior" | "Mid" | "Senior",
    "aiReadinessScore": number (0-100, how prepared they are for AI-enhanced roles),
    "gaps": ["string (specific AI skills, certifications, or knowledge they need to learn)"],
    "strengths": ["string (current AI-related and technical strengths)"],
    "weaknesses": ["string (AI skill gaps that need development)"],
    "aiUpskillOpportunities": ["string (specific AI skills/certifications that would boost their career)"],
    "competitiveAnalysis": {
      "marketReadiness": number (0-100),
      "overallScore": number (0-100),
      "baselineScore": number (0-100),
      "comparedToPeers": "string",
      "estimatedTimeToTarget": "string"
    }
  },
  "roadmap": {
    "summary": "string (2-3 sentences: current AI knowledge → what AI skills they'll learn → career impact)",
    "primaryFocus": "string (the ONE main AI skill area this roadmap develops)",
    "assumptions": "string (hours/week available, their starting AI skill level)",
    "totalDuration": "string (e.g., '3-6 months to gain AI proficiency')",
    "first30Days": ["string (3-5 EXACT actionable items with specific AI courses/resources)"],
    "milestones": [
      { "id": "milestone-1", "title": "string", "timeframeWeeks": number, "description": "string", "successIndicator": "string" }
    ],
    "steps": [
      {
        "id": "step-1",
        "title": "string (specific topic, e.g., 'Learn Supervised Machine Learning Algorithms')",
        "description": "string (brief 2-3 sentence overview of what this topic covers)",
        "goal": "string (1-2 sentence goal, e.g., 'Understand core supervised learning concepts to build predictive models')",
        "category": "Learning" | "Skill Development",
        "priority": "High" | "Medium" | "Low",
        "estimatedHours": number,
        "timeframeWeeks": number,
        "aiSkillFocus": "string (specific AI topic area, e.g., 'Machine Learning', 'NLP', 'Prompt Engineering')",
        "subSteps": [
          {
            "id": "step-1-sub-1",
            "title": "string (sub-topic, e.g., 'Linear Regression and Logistic Regression')",
            "dayRange": "string (e.g., 'Week 1-2')",
            "description": "string (what to learn about this sub-topic)",
            "microTasks": [
              "string (learning objective, e.g., 'Understand how linear regression works mathematically')",
              "string (learning objective, e.g., 'Learn the difference between classification and regression')",
              "string (learning objective, e.g., 'Understand model evaluation metrics like accuracy, precision, recall')"
            ],
            "expectedOutput": "string (knowledge gained, e.g., 'Solid understanding of supervised learning fundamentals')"
          }
        ],
        "prerequisites": ["string (prior knowledge needed)"],
        "completionCriteria": ["string (how to know when mastered, e.g., 'Can explain the topic clearly and apply it')"],
        "keyConceptsToMaster": ["string (important concepts within this step)"],
        "commonMistakes": ["string"],
        "milestone": {
          "title": "string",
          "checkpoints": ["string"]
        }
      }
    ],
    "phase2Skills": [
      { "skill": "string", "reason": "string", "estimatedStart": "string" }
    ]
  }
}
`;


  try {
    // Helper function to safely parse JSON from LLM response
    const safeParseJSON = (rawText: string): any => {
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

    let parsed;
    let attempts = 0;
    const MAX_RETRIES = 3;
    let lastError;

    while (attempts < MAX_RETRIES) {
      attempts++;
      try {
        console.log(`🔄 Attempt ${attempts}/${MAX_RETRIES} calling LLM with model: ${modelKey || 'default'}`);
        console.log('📤 Sending prompt to LLM API...');
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
        return analyzeProfile(profileText, answers, 'gemini');
      }

      throw lastError || new Error('Failed to generate valid profile analysis after multiple retries');
    }

    // Ensure baselineScore is set
    if (parsed.assessment?.competitiveAnalysis && !parsed.assessment.competitiveAnalysis.baselineScore) {
      parsed.assessment.competitiveAnalysis.baselineScore = parsed.assessment.competitiveAnalysis.overallScore || 50;
    }

    // Post-process roadmap steps to ensure realism and measurable milestones
    try {
      const defaultHoursPerWeek = (answers && answers.availableHoursPerWeek) ? Number(answers.availableHoursPerWeek) : 5;
      const roadmap = parsed.roadmap || {};
      const steps = Array.isArray(roadmap.steps) ? roadmap.steps : [];

      for (let s of steps) {
        // Use numbers if string provided
        if (s.estimatedHours == null) {
          s.estimatedHours = 8; // default
        }
        if (s.timeframeWeeks == null) {
          // Rough conversion of hours to weeks using default hours per week
          s.timeframeWeeks = Math.max(1, Math.round((s.estimatedHours / defaultHoursPerWeek)));
        }
        if (!s.completionCriteria || !Array.isArray(s.completionCriteria) || s.completionCriteria.length === 0) {
          s.completionCriteria = [
            `Complete the primary project for this step and share code or demo in portfolio`,
          ];
        }
        // Replace 'master' language with measurable sub-steps to make it human-attainable
        if (typeof s.title === 'string' && /master\b/i.test(s.title)) {
          s.title = s.title.replace(/master\b/ig, 'Develop strong proficiency in');
        }
        if (typeof s.description === 'string' && /master\b/i.test(s.description)) {
          s.description = s.description.replace(/master\b/ig, 'Develop strong proficiency in');
        }
        // Normalize priority into a numeric scale used by the frontend (1=High, 3=Medium, 5=Low)
        if (typeof s.priority === 'string') {
          const pStr = s.priority.toLowerCase();
          if (pStr.includes('high')) s.priority = 1;
          else if (pStr.includes('medium')) s.priority = 3;
          else if (pStr.includes('low')) s.priority = 5;
          else s.priority = 3;
        } else {
          // Ensure number
          s.priority = Number(s.priority) || 3;
        }
        // Add suggested_timeframe for frontend convenience
        if (s.timeframeWeeks != null) s.suggested_timeframe = `${s.timeframeWeeks} weeks`;
      }
      // Write back if changed
      if (parsed.roadmap) {
        parsed.roadmap.steps = steps;
      }
      // Ensure top-level roadmap keys exist
      if (!parsed.roadmap.assumptions) {
        parsed.roadmap.assumptions = `Assuming ${defaultHoursPerWeek} hours/week available for learning (default).`;
      }
      if (!Array.isArray(parsed.roadmap.first30Days) || parsed.roadmap.first30Days.length === 0) {
        parsed.roadmap.first30Days = [
          'Familiarize with your current codebase and gather 2-3 small improvements to implement',
          'Identify a 1-week small demo project to build and include in your portfolio (<= 10 hours)'
        ];
      }
      if (!Array.isArray(parsed.roadmap.milestones) || parsed.roadmap.milestones.length === 0) {
        parsed.roadmap.milestones = [
          { id: 'm-1', title: 'Initial Foundations', timeframeWeeks: 4, description: 'Complete first project and baseline learning materials.' }
        ];
      }

      // Keep steps as-is from LLM - no expansion/splitting needed
      // The LLM prompt now provides detailed, focused steps directly
      if (parsed.roadmap && Array.isArray(parsed.roadmap.steps)) {
        parsed.roadmap.steps = parsed.roadmap.steps.map((step: any) => {
          // Normalize priority to numeric
          if (typeof step.priority === 'string') {
            const pStr = step.priority.toLowerCase();
            if (pStr.includes('high')) step.priority = 1;
            else if (pStr.includes('medium')) step.priority = 3;
            else if (pStr.includes('low')) step.priority = 5;
            else step.priority = 3;
          } else {
            step.priority = Number(step.priority) || 3;
          }
          // Add suggested_timeframe for frontend
          if (step.timeframeWeeks != null) {
            step.suggested_timeframe = `${step.timeframeWeeks} weeks`;
          }
          return step;
        });
      }
    } catch (e) {
      console.warn('⚠️ Post-processing of roadmap failed:', e);
    }

    return parsed;
  } catch (error) {
    console.error('❌ Error analyzing profile:', error);
    throw new Error('Failed to analyze profile');
  }
};

export const generateNextQuestion = async (context: QuestionGenerationContext) => {
  console.log('🤖 generateNextQuestion called');

  let prompt = '';

  if (context.isFirstQuestion) {
    prompt = `
You are an AI Era Career Coach. Your role is to assess how well the candidate has adapted to the AI revolution and their maturity in using AI tools and models.

Based on this resume, generate the FIRST question to understand their AI readiness and adoption level.
Resume: "${context.resumeText.substring(0, 2000)}..."

FOCUS AREAS for first question:
- Their current use of AI tools in daily work
- Whether they've integrated AI into their workflow
- Their awareness of AI capabilities relevant to their field

DOMAIN-SPECIFIC AI TOOLS (use relevant ones based on resume):
• IT/Software: GitHub Copilot, Cursor AI, ChatGPT, Claude, Tabnine, CodeWhisperer
• Healthcare: Clinical AI, medical imaging AI, Nuance DAX, patient triage bots
• Construction: ALICE, Buildots, safety monitoring AI, BIM automation
• Finance: AI risk analysis, fraud detection, Bloomberg AI, robo-advisors
• Marketing: Jasper AI, Copy.ai, Midjourney, HubSpot AI, SEO tools
• Education: Khanmigo, AI tutoring, automated grading, curriculum AI
• Legal: Kira, LawGeex, CoCounsel, Harvey, contract review AI
• HR: Resume screening AI, interview AI, sentiment analysis
• Manufacturing: Predictive maintenance, quality vision AI, supply chain AI
• Real Estate: Valuation AI, virtual staging, market analysis tools
• Retail: Recommendation engines, pricing AI, inventory optimization
• Creative: Midjourney, DALL-E, Runway ML, Adobe Firefly, Canva AI
• Data/Analytics: DataRobot, Tableau AI, Power BI Copilot

Generate ONE focused question that opens the conversation about their AI journey, referencing AI tools relevant to their industry from the resume.

Return ONLY a JSON object in this format (no markdown, no code blocks):
{
  "question": "Your question here"
}
    `.trim();
  } else {
    const lastAnswer = context.conversationHistory[context.conversationHistory.length - 1]?.content || '';
    const previousQuestions = context.conversationHistory
      .filter(m => m.role === 'assistant')
      .map(m => m.content)
      .join('\n');

    // DEBUG: Log what's being passed
    console.log('📝 DEBUG - Last answer:', lastAnswer.substring(0, 100));
    console.log('📝 DEBUG - Previous questions count:', context.conversationHistory.filter(m => m.role === 'assistant').length);
    console.log('📝 DEBUG - Previous questions:', previousQuestions.substring(0, 200));

    const availability = context.answers?.availableHoursPerWeek ? `Candidate available hours/week: ${context.answers.availableHoursPerWeek}` : `Availability not provided`;

    // Count questions and extract covered topics
    const questionNumber = context.conversationHistory.filter(m => m.role === 'assistant').length + 1;

    // Extract key topics from previous questions to prevent repetition
    const bannedKeywords = previousQuestions.toLowerCase();
    const topicsCovered = [];
    if (bannedKeywords.includes('time-consuming') || bannedKeywords.includes('daily task') || bannedKeywords.includes('daily work')) topicsCovered.push('daily tasks/time-consuming work');
    if (bannedKeywords.includes('learn') || bannedKeywords.includes('skill')) topicsCovered.push('learning goals/skills');
    if (bannedKeywords.includes('hours') || bannedKeywords.includes('time') || bannedKeywords.includes('dedicate')) topicsCovered.push('time availability');
    if (bannedKeywords.includes('stopping') || bannedKeywords.includes('barrier') || bannedKeywords.includes('prevent')) topicsCovered.push('barriers to AI adoption');
    if (bannedKeywords.includes('colleague') || bannedKeywords.includes('organization') || bannedKeywords.includes('workplace')) topicsCovered.push('workplace culture');
    if (bannedKeywords.includes('automate') || bannedKeywords.includes('take off')) topicsCovered.push('automation goals');
    if (bannedKeywords.includes('tool') || bannedKeywords.includes('chatgpt') || bannedKeywords.includes('ai')) topicsCovered.push('AI tools used');

    const bannedTopicsStr = topicsCovered.length > 0
      ? `\n❌ BANNED TOPICS (already asked): ${topicsCovered.join(', ')}`
      : '';

    prompt = `
You are an AI Era Career Coach. This is question #${questionNumber}.

Resume: "${context.resumeText.substring(0, 600)}..."
Previous Questions:
${previousQuestions}
Last Answer: "${lastAnswer}"
${availability}
${bannedTopicsStr}

RULES:
1. Generate a NEW question about a DIFFERENT topic than previous questions
2. If their answer was short/vague, ask something simpler and more specific
3. Keep questions SHORT (under 25 words)
4. Be conversational and friendly

POSSIBLE TOPICS (pick ONE not already covered):
- Their biggest work challenges
- Which AI skill they want to learn first  
- How much time they have for learning
- What's preventing them from using AI more
- What outcomes they expect from using AI
- Their workplace culture around AI
- Career goals and aspirations
- Specific tasks they want to automate

Return ONLY JSON (no markdown):
{
  "question": "Your dynamic question here"
}
    `.trim();
  }

  try {
    console.log('📤 Sending question generation prompt to LLM API...');
    const text = await generateContent(prompt, context.modelKey);

    console.log('✅ LLM API response received for question');
    console.log('📝 Response:', text.substring(0, 200));

    // Clean up potential markdown formatting
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    const parsed = JSON.parse(cleanText);

    console.log('✅ Question generated:', parsed.question);
    return parsed;
  } catch (error) {
    console.error('❌ Error generating question:', error);
    throw new Error('Failed to generate question');
  }
};


export const updateProfile = async (currentProfile: any, roadmap: any, progress: any, modelKey?: ModelKey) => {
  console.log('🤖 updateProfile called');

  const completedSteps = progress.filter((p: any) => p.completed).map((p: any) => {
    const step = roadmap.find((s: any) => s.id === p.stepId);
    return step ? step.title : 'Unknown Step';
  });

  const prompt = ` 
    You are a career coach tracking a candidate's progress.
    
    Current Profile Summary:
    ${JSON.stringify(currentProfile)}
    
    Completed Roadmap Steps:
    ${completedSteps.join(', ')}
    
    Task: Update the "classification" and "assessment" sections of the profile to reflect their progress.
    - If they completed a learning step, add that skill to their skills list.
    - If they finished a project, update their experience or portfolio description.
    - Update their "readiness_score" in the assessment if appropriate.
    - Keep the format EXACTLY the same as the input profile.
    
    Return ONLY the updated JSON object for the profile (classification and assessment keys).
  `;

  try {
    const text = await generateContent(prompt, modelKey);
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return JSON.parse(cleanText);
  } catch (error) {
    console.error('❌ Error updating profile:', error);
    throw new Error('Failed to update profile');
  }
};

/**
 * CODING-BASED PROFILE UPDATE (Fast & Deterministic)
 * Updates profile based on completed roadmap steps without using LLM
 * This is much faster and more reliable than the LLM-based approach
 */
export const updateProfileWithCode = (
  currentProfile: any,
  roadmapSteps: any[],
  progress: any[]
): { classification: any; assessment: any } => {


  // 1. Identify completed steps
  const completedStepIds = progress
    .filter(p => p.completed)
    .map(p => p.stepId);

  const completedSteps = roadmapSteps.filter(step =>
    completedStepIds.includes(step.id)
  );



  // 2. Extract skills from completed learning/skill steps
  const extractSkillsFromStep = (step: any): string[] => {
    const skills: string[] = [];
    const title = step.title.toLowerCase();
    const description = step.description.toLowerCase();

    // Extract skills based on step category and content
    const stepCategory = (step.category || 'Learning').toString().toLowerCase();
    if (['learning', 'skill development', 'learn'].includes(stepCategory)) {
      // Extract technology/skill names from title and description
      const text = `${step.title} ${step.description}`;

      // Common patterns for skill extraction
      const skillPatterns = [
        /learn\s+(\w+(?:\s+\w+)?)/gi,
        /master\s+(\w+(?:\s+\w+)?)/gi,
        /study\s+(\w+(?:\s+\w+)?)/gi,
        /(\w+)\s+fundamentals/gi,
        /(\w+)\s+basics/gi,
        /(\w+)\s+development/gi,
        /(\w+)\s+programming/gi,
      ];

      skillPatterns.forEach(pattern => {
        const matches = text.matchAll(pattern);
        for (const match of matches) {
          if (match[1]) {
            skills.push(match[1].trim());
          }
        }
      });
    }

    return skills.filter(s => s.length > 2); // Filter out very short matches
  };

  // 3. Collect new skills from all completed steps
  const newSkillsRaw = completedSteps
    .flatMap(step => extractSkillsFromStep(step))
    .map(skill => skill.charAt(0).toUpperCase() + skill.slice(1)); // Capitalize

  // Remove duplicates
  const newSkillsSet = new Set(newSkillsRaw);
  const newSkills = Array.from(newSkillsSet);



  // 4. Merge with existing skills
  const existingTechnicalSkills = currentProfile.classification?.skills?.technical || [];

  // Filter out previously added roadmap skills (source='roadmap') to allow removal
  // Also keep skills that are strings (legacy/resume) or have source='resume'
  const resumeSkills = existingTechnicalSkills.filter((s: any) => {
    if (typeof s === 'string') return true;
    return s.source !== 'roadmap';
  });

  const existingSkillNames = new Set(resumeSkills.map((s: any) =>
    typeof s === 'string' ? s.toLowerCase() : s.name?.toLowerCase()
  ));

  const skillsToAdd = newSkills
    .filter(skill => !existingSkillNames.has(skill.toLowerCase()))
    .map(skill => ({
      name: skill,
      category: 'technical',
      proficiencyLevel: 'beginner',
      source: 'roadmap' // Tag as roadmap skill
    }));



  // 5. Update classification with new skills - PRESERVE ALL ORIGINAL FIELDS
  const safeClassification = currentProfile.classification || {};
  const safeSkills = safeClassification.skills || { technical: [], soft: [], domain: [] };

  const updatedClassification = {
    ...safeClassification,  // ← CRITICAL: This preserves personalInfo, experience, education,  etc.
    skills: {
      technical: [
        ...resumeSkills, // Keep filtered resume skills
        ...skillsToAdd   // Add current roadmap skills
      ],
      soft: safeSkills.soft || [],
      domain: safeSkills.domain || []
    }
  };


  // 6. Calculate progress metrics
  const totalSteps = roadmapSteps.length;  // Use total roadmap steps, not progress items
  const completedCount = completedStepIds.length;
  const completionRatio = totalSteps > 0 ? completedCount / totalSteps : 0;



  // 7. Update readiness score based on completion
  // CRITICAL: Use baselineScore (original score before any progress) to prevent score inflation
  // If baselineScore doesn't exist yet, save the current score as the baseline
  const baselineScore = currentProfile.assessment?.competitiveAnalysis?.baselineScore
    || currentProfile.assessment?.competitiveAnalysis?.overallScore
    || 55;

  // Add 0.5 points per completed step, capped at 30 points bonus
  const progressBonus = Math.min(30, completedCount * 0.5);
  const newScore = Math.min(100, baselineScore + progressBonus);



  // 8. Create strengths for recently completed steps (last 3)
  const recentCompletedSteps = completedSteps.slice(-3);
  const newStrengths = recentCompletedSteps.map(step => ({
    description: `Completed: ${step.title}`,
    evidence: [`Finished on ${new Date().toLocaleDateString()}`],
    impact: 'medium'
  }));

  // 9. Update assessment - PRESERVE ALL ORIGINAL FIELDS
  const safeAssessment = currentProfile.assessment || {};
  const existingStrengths = safeAssessment.strengths || [];

  // Filter out previously added "Completed:" strengths to prevent duplicates and allow removal
  const originalStrengths = existingStrengths.filter((s: any) => {
    if (typeof s === 'string') {
      return !s.startsWith('Completed: ');
    }
    return !(s?.description?.startsWith?.('Completed: '));
  });

  // 10. Update Role Requirements Match
  const roleRequirements = safeAssessment.roleRequirements || { satisfied: [], missing: [] };

  // Combine all requirements to re-evaluate them from scratch
  // This ensures that if a skill is removed (unchecked), the requirement moves back to missing
  const allRequirements = [
    ...(roleRequirements.satisfied || []),
    ...(roleRequirements.missing || [])
  ];

  // Deduplicate requirements just in case
  const uniqueRequirements = Array.from(new Set(allRequirements));

  const newSatisfied: string[] = [];
  const newMissing: string[] = [];

  // Check if any new skills match missing requirements
  // We check against ALL current skills (resume + roadmap) to be safe
  const allCurrentSkills = [
    ...resumeSkills.map((s: any) => (typeof s === 'string' ? s : s.name).toLowerCase()),
    ...skillsToAdd.map(s => s.name.toLowerCase())
  ];

  uniqueRequirements.forEach((req: string) => {
    const reqLower = req.toLowerCase();
    // Check if any skill is contained in the requirement or vice versa
    const isMatch = allCurrentSkills.some(skill =>
      reqLower.includes(skill) || skill.includes(reqLower)
    );

    if (isMatch) {
      newSatisfied.push(req);
    } else {
      newMissing.push(req);
    }
  });

  const updatedAssessment = {
    ...safeAssessment,  // ← CRITICAL: This preserves targetRole, gaps, weaknesses, etc.
    competitiveAnalysis: {
      ...(safeAssessment.competitiveAnalysis || {}),
      baselineScore: baselineScore,  // ← Store the original baseline score
      overallScore: Math.round(newScore),
      marketReadiness: Math.round(completionRatio * 100),
      comparedToPeers: completionRatio >= 0.75 ? 'above_average' :
        completionRatio >= 0.5 ? 'average' :
          completionRatio >= 0.25 ? 'below_average' : 'beginner',
      estimatedTimeToTarget: completionRatio >= 0.75 ? '1-2 months' :
        completionRatio >= 0.5 ? '2-4 months' :
          completionRatio >= 0.25 ? '4-6 months' : '6+ months'
    },
    strengths: [
      ...originalStrengths, // Keep original strengths
      ...newStrengths       // Add current progress strengths
    ].slice(0, 10), // Max 10 total strengths
    roleRequirements: {
      satisfied: newSatisfied,
      missing: newMissing
    }
  };



  return {
    classification: updatedClassification,
    assessment: updatedAssessment
  };
};
