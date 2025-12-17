/**
 * Unified LLM Provider - Supports Official Gemini API, OpenRouter, and NVIDIA API
 * - 'gemini' model uses Official Gemini API (GEMINI_API_KEY)
 * - 'deepseek-v3.1' uses NVIDIA API (NVIDIA_API_KEY)
 * - All other models use OpenRouter (OPENROUTER_API_KEY)
 */

import axios from 'axios';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OpenAI from 'openai';

// Available models - Gemini uses official API, others use OpenRouter
export const AVAILABLE_MODELS = {
    // Official Gemini API (uses GEMINI_API_KEY)
    'gemini': {
        id: 'gemini-2.0-flash',
        name: 'Gemini 2.0 Flash (Official)',
        provider: 'Google',
        isOfficial: true
    },
    // OpenRouter models (use OPENROUTER_API_KEY)
    'deepseek-r1t2-chimera': {
        id: 'tngtech/deepseek-r1t2-chimera:free',
        name: 'DeepSeek R1T2 Chimera',
        provider: 'TNGTech',
        isOfficial: false
    },
    'kat-coder-pro': {
        id: 'kwaipilot/kat-coder-pro:free',
        name: 'KAT Coder Pro',
        provider: 'Kwaipilot',
        isOfficial: false
    },
    'nemotron-nano-12b': {
        id: 'nvidia/nemotron-nano-12b-v2-vl:free',
        name: 'Nemotron Nano 12B',
        provider: 'NVIDIA',
        isOfficial: false
    },
    'deepseek-r1t-chimera': {
        id: 'tngtech/deepseek-r1t-chimera:free',
        name: 'DeepSeek R1T Chimera',
        provider: 'TNGTech',
        isOfficial: false
    },
    'glm-4.5-air': {
        id: 'z-ai/glm-4.5-air:free',
        name: 'GLM 4.5 Air',
        provider: 'Z-AI',
        isOfficial: false
    },
    'llama-3.3-70b': {
        id: 'meta-llama/llama-3.3-70b-instruct:free',
        name: 'Llama 3.3 70B',
        provider: 'Meta',
        isOfficial: false
    },
    'mistral-nemo': {
        id: 'mistralai/mistral-nemo:free',
        name: 'Mistral Nemo',
        provider: 'Mistral AI',
        isOfficial: false
    },
    'gpt-oss-120b': {
        id: 'openai/gpt-oss-20b:free',
        name: 'GPT-OSS 120B (Unstable)',
        provider: 'OpenAI',
        isOfficial: false,
        isNvidia: false
    },
    // NVIDIA API models (use NVIDIA_API_KEY)
    'deepseek-v3.1': {
        id: 'deepseek-ai/deepseek-v3.1',
        name: 'DeepSeek v3.1 (NVIDIA)',
        provider: 'NVIDIA',
        isOfficial: false,
        isNvidia: true
    },
    'qwen3-80b': {
        id: 'qwen/qwen3-next-80b-a3b-instruct',
        name: 'Qwen3 Next 80B (NVIDIA)',
        provider: 'NVIDIA',
        isOfficial: false,
        isNvidia: true
    }
} as const;

export type ModelKey = keyof typeof AVAILABLE_MODELS;

// Default model - Official Gemini API for reliability
const DEFAULT_MODEL: ModelKey = 'gemini';

// OpenRouter API configuration
const OPENROUTER_API_URL = 'https://openrouter.ai/api/v1/chat/completions';

// NVIDIA API configuration
const NVIDIA_API_URL = 'https://integrate.api.nvidia.com/v1';

/**
 * Generate content using Official Gemini API
 */
async function generateWithGemini(prompt: string): Promise<string> {
    const apiKey = process.env.GEMINI_API_KEY;

    if (!apiKey) {
        throw new Error('GEMINI_API_KEY is not set in environment variables');
    }

    // Debug: Show key info for verification (first 4 + last 4 chars)
    console.log(`🔑 GEMINI_API_KEY loaded: ${apiKey.substring(0, 4)}...${apiKey.substring(apiKey.length - 4)} (length: ${apiKey.length})`);
    console.log('🤖 Using Official Gemini API (gemini-2.0-flash)');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const content = response.text();

    console.log(`✅ Gemini response received (${content.length} chars)`);
    return content;
}

/**
 * Generate content using NVIDIA API (for DeepSeek v3.1)
 * Uses OpenAI SDK with NVIDIA base URL
 */
async function generateWithNvidia(
    prompt: string,
    modelId: string,
    modelName: string,
    retries: number = 3
): Promise<string> {
    const apiKey = process.env.NVIDIA_API_KEY;

    if (!apiKey) {
        throw new Error('NVIDIA_API_KEY is not set in environment variables');
    }

    // Debug: Show key info for verification
    console.log(`🔑 NVIDIA_API_KEY loaded: ${apiKey.substring(0, 8)}...${apiKey.substring(apiKey.length - 4)} (length: ${apiKey.length})`);
    console.log(`🤖 Using NVIDIA API: ${modelName} (${modelId})`);

    const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: NVIDIA_API_URL,
    });

    let lastError: Error | null = null;
    let delay = 2000;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const completion = await openai.chat.completions.create({
                model: modelId,
                messages: [{ role: 'user', content: prompt }],
                temperature: 0.7,
                top_p: 0.7,
                max_tokens: 8192,
            });

            const content = completion.choices[0]?.message?.content;
            if (content) {
                console.log(`✅ NVIDIA response received (${content.length} chars)`);
                return content;
            }

            throw new Error('Invalid response structure from NVIDIA API');
        } catch (error: any) {
            lastError = error;

            // Check for rate limiting
            if (error.status === 429) {
                console.warn(`⚠️ NVIDIA Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2;
                continue;
            }

            console.error('❌ NVIDIA API error:', error.message || error);
            throw error;
        }
    }

    throw lastError || new Error('Max retries reached for NVIDIA API');
}

/**
 * Generate content using OpenRouter API
 */
async function generateWithOpenRouter(
    prompt: string,
    modelId: string,
    modelName: string,
    retries: number = 3
): Promise<string> {
    const apiKey = process.env.OPENROUTER_API_KEY;

    if (!apiKey) {
        throw new Error('OPENROUTER_API_KEY is not set in environment variables');
    }

    console.log(`🤖 Using OpenRouter: ${modelName} (${modelId})`);

    let lastError: Error | null = null;
    let delay = 2000;

    for (let attempt = 0; attempt < retries; attempt++) {
        try {
            const response = await axios.post(
                OPENROUTER_API_URL,
                {
                    model: modelId,
                    messages: [
                        {
                            role: 'user',
                            content: prompt
                        }
                    ],
                    max_tokens: 8000,
                    temperature: 0.7
                },
                {
                    headers: {
                        'Authorization': `Bearer ${apiKey}`,
                        'Content-Type': 'application/json',
                        'HTTP-Referer': 'http://localhost:3000',
                        'X-Title': 'Career Roadmap AI'
                    }
                }
            );

            if (response.data?.choices?.[0]?.message?.content) {
                const content = response.data.choices[0].message.content;
                console.log(`✅ OpenRouter response received (${content.length} chars)`);
                return content;
            }

            throw new Error('Invalid response structure from OpenRouter');
        } catch (error: any) {
            lastError = error;

            // Check for rate limiting
            if (error.response?.status === 429) {
                console.warn(`⚠️ Rate limit hit (429). Retrying in ${delay}ms... (Attempt ${attempt + 1}/${retries})`);
                await new Promise(resolve => setTimeout(resolve, delay));
                delay *= 2; // Exponential backoff
                continue;
            }

            // Check for other API errors
            if (error.response?.data?.error) {
                console.error('❌ OpenRouter API error:', error.response.data.error);
                throw new Error(`OpenRouter API error: ${error.response.data.error.message || 'Unknown error'}`);
            }

            throw error;
        }
    }

    throw lastError || new Error('Max retries reached for OpenRouter API');
}

/**
 * Generate content using the specified model
 * - 'gemini' uses Official Gemini API
 * - 'deepseek-v3.1' uses NVIDIA API
 * - All other models use OpenRouter
 * @param prompt - The prompt to send to the LLM
 * @param modelKey - The model to use (defaults to 'gemini')
 * @param retries - Number of retries for rate limiting
 */
export async function generateContent(
    prompt: string,
    modelKey?: ModelKey | string,
    retries: number = 3
): Promise<string> {
    // Resolve model
    const selectedModelKey = (modelKey && modelKey in AVAILABLE_MODELS)
        ? modelKey as ModelKey
        : DEFAULT_MODEL;

    const selectedModel = AVAILABLE_MODELS[selectedModelKey];

    // Use Official Gemini API for 'gemini' model
    if (selectedModelKey === 'gemini') {
        return generateWithGemini(prompt);
    }

    // Use NVIDIA API for DeepSeek v3.1
    if ('isNvidia' in selectedModel && selectedModel.isNvidia) {
        return generateWithNvidia(prompt, selectedModel.id, selectedModel.name, retries);
    }

    // Use OpenRouter for all other models
    return generateWithOpenRouter(prompt, selectedModel.id, selectedModel.name, retries);
}

/**
 * Get list of available models for frontend dropdown
 */
export function getAvailableModels() {
    return Object.entries(AVAILABLE_MODELS).map(([key, value]) => ({
        key,
        ...value
    }));
}
