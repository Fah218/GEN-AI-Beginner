
import 'dotenv/config';
import Anthropic from '@anthropic-ai/sdk';
import readlineSync from 'readline-sync';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

const ai = new Anthropic({
  apiKey: ANTHROPIC_API_KEY
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
      const response = await ai.messages.create({
        model: 'claude-sonnet-4-5',
        max_tokens: 500,
        temperature: 0.7,
        messages: history
      });

      const answer = response.content
        .filter(block => block.type === 'text')
        .map(block => block.text)
        .join('\n');

      console.log('\nClaude:', answer, '\n');

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
