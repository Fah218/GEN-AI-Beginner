
import 'dotenv/config';
import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  SystemMessage,
  HumanMessage,
  AIMessage
} from '@langchain/core/messages';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 500
});

async function main() {
  const messages = [
    new SystemMessage(
      'You are a helpful DSA tutor. Explain concepts simply.'
    ),
    new HumanMessage('What is a stack?'),
    new AIMessage(
      'A stack is a linear data structure that follows LIFO: Last In, First Out.'
    ),
    new HumanMessage('Give me a real-life example.')
  ];

  try {
    const response = await model.invoke(messages);
    console.log('\nAI:', response.content);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
