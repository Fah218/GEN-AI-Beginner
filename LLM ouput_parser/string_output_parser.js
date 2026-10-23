
import 'dotenv/config';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { StringOutputParser } from '@langchain/core/output_parsers';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7
});

// Convert the model's AI message into a plain string.
const parser = new StringOutputParser();

// Connect model and parser into a runnable chain.
const chain = model.pipe(parser);

async function main() {
  try {
    const result = await chain.invoke(
      'Explain binary search in simple words with an example.'
    );

    console.log(result);
    console.log('\nOutput type:', typeof result);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
