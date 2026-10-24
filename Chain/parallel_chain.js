
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

const explanationPrompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with one example."
);

const complexityPrompt = ChatPromptTemplate.fromTemplate(
  "Explain the best, average, and worst-case time complexity of {topic}."
);

const explanationChain = explanationPrompt
  | model
  | parser;

const complexityChain = complexityPrompt
  | model
  | parser;

const parallelChain = RunnableParallel.from({
  explanation: explanationChain,
  complexity: complexityChain,
});

const result = await parallelChain.invoke({
  topic: "Binary Search",
});

console.log("Explanation:\n", result.explanation);
console.log("\nTime Complexity:\n", result.complexity);
