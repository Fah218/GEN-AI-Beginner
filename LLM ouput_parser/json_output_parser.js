
import 'dotenv/config';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { JsonOutputParser } from '@langchain/core/output_parsers';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0
});

const parser = new JsonOutputParser();

const prompt = ChatPromptTemplate.fromTemplate(`
You are a DSA tutor.

Explain the following topic and return a valid JSON object
with these fields:
- topic: string
- definition: string
- time_complexity: string
- requires_sorted_input: boolean

Do not include Markdown fences around the JSON.

Topic: {topic}
`);

const chain = prompt.pipe(model).pipe(parser);

async function main() {
  try {
    const result = await chain.invoke({
      topic: 'Binary Search'
    });

    console.log('\nParsed JSON object:');
    console.log(result);

    console.log('\nTopic:', result.topic);
    console.log('Time complexity:', result.time_complexity);
    console.log('Requires sorted input:', result.requires_sorted_input);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
