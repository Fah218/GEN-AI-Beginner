
import 'dotenv/config';
import { InferenceClient } from '@huggingface/inference';
import readlineSync from 'readline-sync';

const HF_TOKEN = process.env.HF_TOKEN;

if (!HF_TOKEN) {
  throw new Error('Please add HF_TOKEN to your .env file.');
}

const ai = new InferenceClient(HF_TOKEN);

const history = [];

async function main() {
  while (true) {
    const userProblem = readlineSync.question(
      'Ask me anything (type exit to quit)--> '
    );

    if (userProblem.trim().toLowerCase() === 'exit') {
      break;
    }

    history.push({
      role: 'user',
      content: userProblem
    });

    try {
      const response = await ai.chatCompletion({
        model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
        messages: history,
        max_tokens: 500,
        temperature: 0.7
      });

      const answer =
        response.choices[0].message.content ?? '';

      console.log('\nTinyLlama:', answer, '\n');

      history.push({
        role: 'assistant',
        content: answer
      });
    } catch (error) {
      console.error('Error:', error.message);
      history.pop();
    }
  }
}

main();
