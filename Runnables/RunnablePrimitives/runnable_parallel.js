
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableParallel } from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const parser = new StringOutputParser();

// Branch 1: Explain the topic
const explainPrompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with an example."
);

const explainChain = explainPrompt
  .pipe(model)
  .pipe(parser);

// Branch 2: Explain time complexity
const complexityPrompt = ChatPromptTemplate.fromTemplate(
  "Explain the best, average, and worst-case time complexity of {topic}."
);

const complexityChain = complexityPrompt
  .pipe(model)
  .pipe(parser);

// Run both chains in parallel
const parallelChain = RunnableParallel.from({
  explanation: explainChain,
  complexity: complexityChain,
});

// Execute both branches with the same input
const result = await parallelChain.invoke({
  topic: "Binary Search",
});

console.log("\nExplanation:\n", result.explanation);
console.log("\nTime Complexity:\n", result.complexity);
