
import 'dotenv/config';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

const ai = new OpenAI({
  apiKey: OPENAI_API_KEY
});

const history = [];

async function main() {
  while (true) {
    const userProblem = readlineSync.question(
      'Ask me anything (type exit to quit)--> '
    );

    if (userProblem.toLowerCase() === 'exit') {
      break;
    }

    history.push({
      role: 'user',
      content: userProblem
    });

    try {
      const response = await ai.chat.completions.create({
        model: 'gpt-4.1-mini',
        messages: history,
        temperature: 0.7,
        max_completion_tokens: 500
      });

      const answer = response.choices[0].message.content;

      console.log('\nGPT:', answer, '\n');

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
