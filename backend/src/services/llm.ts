import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/config';

const genAI = new GoogleGenerativeAI(config.geminiApiKey);

export const analyzeProfile = async (profileText: string, answers: any) => {
  console.log('🤖 analyzeProfile called');
  console.log('📝 Profile text length:', profileText?.length || 0);
  console.log('📋 Answers:', answers);

  const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });
  console.log('✅ Gemini model initialized (gemini-2.0-flash)');

  const prompt = `
    You are a career coach. Analyze the following resume text and questionnaire answers to identify skill and experience gaps for the target role.
    
    Resume Text:
    ${profileText}
    
    Questionnaire Answers:
    ${JSON.stringify(answers)}
    
    Output JSON format:
    {
      "gaps": [
        {
          "id": "unique_id",
          "type": "skill" | "experience" | "certification",
          "description": "Description of the gap",
          "severity": "critical" | "important" | "optional",
          "evidence": "Why this is a gap based on the resume/answers"
        }
      ],
      "roadmap": [
        {
          "id": "unique_id",
          "title": "Actionable Step Title",
          "description": "Detailed description of what to do",
          "category": "learn" | "project" | "certification" | "networking",
          "priority": 1-5,
          "suggested_timeframe": "e.g., 1 month"
        }
      ]
    }
    
    Ensure the output is valid JSON. Do not include markdown formatting like \`\`\`json.
  `;

  try {
    console.log('📤 Sending prompt to Gemini API...');
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    console.log('✅ Gemini API response received');
    console.log('📝 Response length:', text.length);
    console.log('📝 First 300 chars:', text.substring(0, 300));

    // Clean up potential markdown formatting if the model ignores instructions
    const cleanText = text.replace(/```json/g, '').replace(/```/g, '').trim();
    console.log('🧽 Cleaned text length:', cleanText.length);

    const parsed = JSON.parse(cleanText);
    console.log('✅ JSON parsed successfully');
    console.log('📊 Parsed data:', {
      gapsCount: parsed.gaps?.length || 0,
      roadmapCount: parsed.roadmap?.length || 0
    });
    return parsed;
  } catch (error) {
    console.error('❌ Error calling Gemini API:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
    }
    throw new Error('Failed to analyze profile');
  }
};
