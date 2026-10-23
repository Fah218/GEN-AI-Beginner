
import 'dotenv/config';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { ChatPromptTemplate } from '@langchain/core/prompts';
import { StructuredOutputParser } from '@langchain/core/output_parsers';
import { z } from 'zod';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0
});

// Step 1: Define the expected structure.
const parser = StructuredOutputParser.fromZodSchema(
  z.object({
    topic: z.string().describe('The DSA topic name'),
    definition: z.string().describe('A simple definition'),
    time_complexity: z.string().describe('Time complexity'),
    requires_sorted_input: z.boolean().describe(
      'Whether the algorithm requires sorted input'
    )
  })
);

// Step 2: Add the parser's formatting instructions to the prompt.
const prompt = ChatPromptTemplate.fromTemplate(`
You are a helpful DSA tutor.
Answer the question using the requested output format.

{format_instructions}

Question: {question}
`);

const chain = prompt.pipe(model).pipe(parser);

async function main() {
  try {
    const result = await chain.invoke({
      question: 'Explain binary search.',
      format_instructions: parser.getFormatInstructions()
    });

    console.log('\nStructured result:');
    console.log(result);

    console.log('\nTopic:', result.topic);
    console.log('Definition:', result.definition);
    console.log('Time complexity:', result.time_complexity);
    console.log('Requires sorted input:', result.requires_sorted_input);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
