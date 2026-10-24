import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const parser = new StringOutputParser();

const explainPrompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with one example."
);

const questionPrompt = ChatPromptTemplate.fromTemplate(
  "Based on this explanation, generate 3 practice questions about {topic}.\n\nExplanation:\n{explanation}"
);

const explainChain = explainPrompt
  | model
  | parser;

const sequentialChain = RunnableSequence.from([
  explainChain,
  async (explanation) => ({
    topic: "Binary Search",
    explanation,
  }),
  questionPrompt,
  model,
  parser,
]);

const result = await sequentialChain.invoke({
  topic: "Binary Search",
});

console.log(result);

import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const parser = new StringOutputParser();

const explainPrompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with one example."
);

const questionPrompt = ChatPromptTemplate.fromTemplate(
  "Based on this explanation, generate 3 practice questions about {topic}.\n\nExplanation:\n{explanation}"
);

const explainChain = explainPrompt
  | model
  | parser;

const sequentialChain = RunnableSequence.from([
  explainChain,
  async (explanation) => ({
    topic: "Binary Search",
    explanation,
  }),
  questionPrompt,
  model,
  parser,
]);

const result = await sequentialChain.invoke({
  topic: "Binary Search",
});

console.log(result);
