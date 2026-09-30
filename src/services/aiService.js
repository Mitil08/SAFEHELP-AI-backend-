import { getGeminiModel, isGeminiConfigured } from '../config/gemini.js';

/**
 * Intelligent local triage parser fallback when API key is not present or offline
 */
const fallbackEmergencyAnalysis = (text = '') => {
  const lower = text.toLowerCase();
  let severity = 'MEDIUM';
  let incident_type = 'Emergency Assistance';
  let injury_reported = false;
  let hazard_reported = false;
  let people_involved = 1;

  if (lower.includes('heart') || lower.includes('bleed') || lower.includes('unconscious') || lower.includes('not breathing') || lower.includes('dying') || lower.includes('critical')) {
    severity = 'CRITICAL';
    injury_reported = true;
    incident_type = 'Critical Medical Emergency';
  } else if (lower.includes('fire') || lower.includes('smoke') || lower.includes('flame') || lower.includes('burn')) {
    severity = 'CRITICAL';
    hazard_reported = true;
    incident_type = 'Fire Hazard';
  } else if (lower.includes('accident') || lower.includes('crash') || lower.includes('collision') || lower.includes('hit')) {
    severity = 'HIGH';
    injury_reported = lower.includes('hurt') || lower.includes('injur') || lower.includes('pain');
    incident_type = 'Traffic / Vehicular Accident';
  } else if (lower.includes('rob') || lower.includes('attack') || lower.includes('weapon') || lower.includes('thief')) {
    severity = 'HIGH';
    hazard_reported = true;
    incident_type = 'Personal Threat / Violence';
  }

  // Count people estimation
  const numMatch = lower.match(/(\d+)\s*(people|persons|friends|passengers)/);
  if (numMatch && numMatch[1]) {
    people_involved = Math.min(Math.max(parseInt(numMatch[1], 10), 1), 20);
  } else if (lower.includes('we ') || lower.includes('friend and i') || lower.includes('us ')) {
    people_involved = 2;
  }

  return {
    incident_type,
    severity,
    people_involved,
    injury_reported,
    hazard_reported,
    ai_summary: text.length > 200 ? text.substring(0, 197) + '...' : text,
    recommended_action: severity === 'CRITICAL' 
      ? 'Ensure immediate physical safety. Keep airways open. Await dispatched responders.' 
      : 'Stay calm. Move away from active traffic or hazards. Keep phone line open.',
    confidence: 'local_heuristic'
  };
};

export const aiService = {
  /**
   * Analyze text or speech transcription
   */
  async analyzeEmergencyText(text) {
    if (!text || text.trim() === '') {
      throw new Error('Emergency description text cannot be empty');
    }

    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel('gemini-1.5-flash');
        const prompt = `
You are SafeHelp AI, an emergency dispatch and accessibility assistant.
Analyze this emergency description and extract structured information in JSON format ONLY.
Do NOT output markdown code fences or backticks. Return raw JSON.

User emergency description: "${text}"

Required JSON schema:
{
  "incident_type": "string (e.g. Medical Emergency, Traffic Accident, Fire Hazard, Assault, Natural Disaster, Other)",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "people_involved": number,
  "injury_reported": boolean,
  "hazard_reported": boolean,
  "ai_summary": "Concise 1-2 sentence emergency summary for emergency services",
  "recommended_action": "Immediate, short, safe action instructions for the user"
}
`;
        const result = await model.generateContent(prompt);
        const responseText = result.response.text().trim();
        
        // Clean possible markdown fences
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          ...parsed,
          confidence: 'gemini_multimodal'
        };
      } catch (err) {
        console.warn('Gemini text analysis error, using fallback analyzer:', err.message);
      }
    }

    return fallbackEmergencyAnalysis(text);
  },

  /**
   * Analyze image with Gemini Vision and extract OCR / scene understanding
   */
  async analyzeEmergencyImage(imageBuffer, mimeType = 'image/jpeg', userPrompt = '') {
    if (isGeminiConfigured()) {
      try {
        const model = getGeminiModel('gemini-1.5-flash');
        const imagePart = {
          inlineData: {
            data: imageBuffer.toString('base64'),
            mimeType
          }
        };

        const prompt = `
You are SafeHelp AI, an emergency visual recognition and OCR assistant for vulnerable individuals.
Analyze this photo taken by the user during an emergency situation.
${userPrompt ? `User notes: "${userPrompt}"` : ''}

CRITICAL RULES:
- Do NOT claim 100% certainty. Use careful phrasing ("The image appears to show...", "Text visible on sign appears to read...").
- If text is blurry or partially obscured, state: "The text is unclear. Please verify visually."
- Detect any visible hazards (fire, smoke, broken glass, downed powerlines, vehicle collision).
- Extract any visible signs, street names, building numbers, or warning labels (OCR).

Return RAW JSON ONLY with NO markdown fences:
{
  "scene_description": "Clear, objective description of what is visible",
  "hazards_detected": ["list of identified environmental hazards"],
  "extracted_text": "Any text/signs visible in the image, or note if none/unclear",
  "incident_type": "Medical" | "Traffic Accident" | "Fire Hazard" | "Hazardous Area" | "General Assistance",
  "severity": "CRITICAL" | "HIGH" | "MEDIUM" | "LOW",
  "recommended_action": "Immediate safety advice based on visual scene"
}
`;
        const result = await model.generateContent([prompt, imagePart]);
        const responseText = result.response.text().trim();
        const cleaned = responseText.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);
        return {
          ...parsed,
          confidence: 'gemini_vision'
        };
      } catch (err) {
        console.warn('Gemini image analysis error, using fallback:', err.message);
      }
    }

    // Fallback when Gemini is unavailable
    return {
      scene_description: 'Image received and recorded for emergency dispatch verification.',
      hazards_detected: ['Visual assessment pending responder review'],
      extracted_text: 'Text extraction unavailable in offline mode. Please verify road markers directly.',
      incident_type: 'General Assistance',
      severity: 'HIGH',
      recommended_action: 'Stay in a safe location away from oncoming traffic. Keep phone battery conserved.',
      confidence: 'simulated_vision'
    };
  }
};
