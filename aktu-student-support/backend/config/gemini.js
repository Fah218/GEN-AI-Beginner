const { GoogleGenAI } = require('@google/genai');
const { redactSecrets } = require('../middleware/errorHandler');

let aiClient = null;

function getGeminiClient() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not configured on the backend.');
  }

  if (!aiClient) {
    aiClient = new GoogleGenAI({
      apiKey,
    });
  }

  return aiClient;
}

/**
 * System instruction identifying this assistant and clearly setting expectations:
 * - Temporary Non-RAG implementation
 * - No fake or hallucinated circulars/policies
 * - Honest advisory limitations
 */
const SYSTEM_INSTRUCTION = `You are the AKTU Student Support AI Assistant, an AI companion built to help students of Dr. A.P.J. Abdul Kalam Technical University (AKTU, formerly UPTU).

Important Context & Boundaries (Phase 2 - Non-RAG Mode):
1. You are running in a direct AI mode (Non-RAG). Verified AKTU document retrieval, embeddings, and official PDF vector search have NOT been enabled yet.
2. Clearly identify your answers as advisory when discussing university regulations.
3. NEVER invent official AKTU circular numbers, fake clause citations, fake exam dates, or fabricated ordinances.
4. If asked about official rules (e.g. grace marks, challenge evaluation, COP back papers, syllabus, attendance, detention), provide standard AKTU academic guidelines if you know them accurately, but explicitly remind the student:
   "Advisory Note: This response is generated without live RAG document verification. Please verify the latest official circular on the AKTU ERP portal (erp.aktu.ac.in) or with your college examination controller."
5. If you do not have enough verified information to answer an inquiry with confidence, state that clearly and suggest consulting the Dean of Academics or checking the AKTU circulars archive.
6. Maintain a helpful, respectful, empathetic, and encouraging tone suitable for engineering and university students.`;

/**
 * Sends a conversation to Gemini using the official @google/genai SDK
 *
 * @param {Array<{sender: string, content: string}>} history - Previous messages
 * @param {string} userMessage - The new user question
 * @returns {Promise<string>} - Model reply text
 */
async function generateGeminiReply(history, userMessage) {
  const client = getGeminiClient();
  const modelName = process.env.GEMINI_MODEL || 'gemini-2.5-flash';

  // Format history into Gemini API contents structure: [{ role: 'user'|'model', parts: [{ text }] }]
  const contents = [];

  if (Array.isArray(history)) {
    for (const msg of history) {
      if (!msg || !msg.content) continue;
      const role = (msg.sender === 'user') ? 'user' : 'model';
      contents.push({
        role,
        parts: [{ text: msg.content }],
      });
    }
  }

  // Append latest user message
  contents.push({
    role: 'user',
    parts: [{ text: userMessage }],
  });

  try {
    const response = await client.models.generateContent({
      model: modelName,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
      },
    });

    const replyText = response.text;
    if (!replyText) {
      throw new Error('Gemini returned an empty response.');
    }

    return replyText;
  } catch (error) {
    console.error('[Gemini Service] Error:', redactSecrets(error.message || ''));
    throw error;
  }
}

module.exports = {
  getGeminiClient,
  generateGeminiReply,
  SYSTEM_INSTRUCTION,
};
