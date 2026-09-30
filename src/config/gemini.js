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

export const getGeminiModel = (modelName = 'gemini-1.5-flash') => {
  if (!genAI) return null;
  return genAI.getGenerativeModel({ model: modelName });
};

export const isGeminiConfigured = () => !!genAI && !!ENV.GEMINI_API_KEY;
