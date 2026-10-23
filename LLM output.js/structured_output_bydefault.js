
import 'dotenv/config';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import { z } from 'zod';

// Step 1: Define the output schema.
const DSAResponseSchema = z.object({
  topic: z.string().describe('The name of the DSA topic'),

  definition: z.string().describe(
    'A simple definition of the topic'
  ),

  time_complexity: z.string().describe(
    'The time complexity, where applicable'
  ),

  requires_sorted_input: z.boolean().describe(
    'Whether the algorithm requires sorted input'
  ),

  examples: z.array(z.string()).describe(
    'A list of practical examples or use cases'
  )
});

// Step 2: Initialize the chat model.
const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0
});

// Step 3: Bind the schema to the model.
const structuredModel = model.withStructuredOutput(
  DSAResponseSchema
);

// Step 4: Invoke the model.
async function main() {
  try {
    const result = await structuredModel.invoke(
      'Explain binary search for a beginner.'
    );

    // Step 5: Use the returned object.
    console.log('\nStructured output:\n');
    console.log(JSON.stringify(result, null, 2));

    console.log('\nAccess individual fields:');
    console.log('Topic:', result.topic);
    console.log('Definition:', result.definition);
    console.log('Time complexity:', result.time_complexity);
    console.log(
      'Requires sorted input:',
      result.requires_sorted_input
    );
    console.log('Examples:', result.examples);
  } catch (error) {
    console.error('Error:', error.message);
  }
}

main();
