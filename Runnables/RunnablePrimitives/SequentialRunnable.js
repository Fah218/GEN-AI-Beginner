
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableSequence,
  RunnableLambda,
} from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const parser = new StringOutputParser();

// Step 1: Explain the topic
const explainPrompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with one example."
);

// Step 2: Generate questions from the explanation
const questionPrompt = ChatPromptTemplate.fromTemplate(
  "Based on the following explanation, generate 3 practice questions:\n\n{explanation}"
);

// Connect all steps sequentially
const chain = RunnableSequence.from([
  explainPrompt,
  model,
  parser,

  // Convert the explanation string into an object
  RunnableLambda.from((explanation) => ({
    explanation,
  })),

  questionPrompt,
  model,
  parser,
]);

const result = await chain.invoke({
  topic: "Binary Search",
});

console.log("\nPractice Questions:\n");
console.log(result);
