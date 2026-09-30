import { GoogleGenerativeAI } from '@google/generative-ai';
import { ENV } from './env.js';

let genAI = null;

if (ENV.GEMINI_API_KEY) {
  try {
    genAI = new GoogleGenerativeAI(ENV.GEMINI_API_KEY);
    console.log('✅ Google Gemini API initialized.');
  } catch (err) {
    console.warn('⚠️ Gemini initialization error:', err.message);
  }
} else {
  console.log('ℹ️ GEMINI_API_KEY not configured. Running AI with intelligent emergency fallback mode.');
}

export const getGeminiModel = (modelName = 'gemini-3.5-flash') => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
};

/**
 * Resilient Flash 3.5 generation with automatic capacity failover
 */
export const generateWithFlash = async (contents) => {
  const models = ['gemini-3.5-flash', 'gemini-3.5-flash-lite'];
  let lastError = null;

  for (const modelName of models) {
    try {
      const model = getGeminiModel(modelName);
      const result = await model.generateContent(contents);
      return { response: result.response, modelName };
    } catch (err) {
      lastError = err;
      console.warn(`⚠️ ${modelName} spike/unavailable (${err.message.substring(0, 60)}). Trying backup...`);
    }
  }

  throw lastError || new Error('All Flash 3.5 models busy');
};

export const isGeminiConfigured = () => !!genAI && !!ENV.GEMINI_API_KEY;
