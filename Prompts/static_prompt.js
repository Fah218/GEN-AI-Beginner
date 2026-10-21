
import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 500
});

async function main() {
  const prompt = 'Explain binary search in simple words with an example.';

  try {
    const response = await model.invoke(prompt);
    console.log('\nAI:', response.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
