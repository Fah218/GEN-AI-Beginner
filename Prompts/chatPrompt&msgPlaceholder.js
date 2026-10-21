
import 'dotenv/config';
import readlineSync from 'readline-sync';

import { ChatGoogleGenerativeAI } from '@langchain/google-genai';
import {
  ChatPromptTemplate,
  MessagesPlaceholder
} from '@langchain/core/prompts';

import {
  HumanMessage,
  AIMessage
} from '@langchain/core/messages';

const model = new ChatGoogleGenerativeAI({
  model: 'gemini-2.5-flash',
  apiKey: process.env.GEMINI_API_KEY,
  temperature: 0.7,
  maxOutputTokens: 500
});

const history = [];

const promptTemplate = ChatPromptTemplate.fromMessages([
  [
    'system',
    'You are a helpful {role}. Explain concepts at a {level} level.'
  ],
  new MessagesPlaceholder('history'),
  ['human', '{question}']
]);

async function main() {
  console.log('Chat started. Type exit to quit.\n');

  while (true) {
    const question = readlineSync.question('You: ');

    if (question.trim().toLowerCase() === 'exit') {
      break;
    }

    try {
      const messages = await promptTemplate.invoke({
        role: 'DSA tutor',
        level: 'beginner',
        history,
        question
      });

      const response = await model.invoke(messages);
      const answer = response.content;

      console.log('\nAI:', answer, '\n');

      history.push(new HumanMessage(question));
      history.push(new AIMessage(answer));
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

main();
