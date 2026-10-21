
import 'dotenv/config';
import readlineSync from 'readline-sync';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 500
});

async function main() {
  const topic = readlineSync.question('Enter topic: ');
  const level = readlineSync.question(
    'Enter difficulty (beginner/intermediate/advanced): '
  );

  const prompt = `Explain ${topic} at a ${level} level.
Give a simple example where useful.`;

  try {
    const response = await model.invoke(prompt);
    console.log('\nAI:', response.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
