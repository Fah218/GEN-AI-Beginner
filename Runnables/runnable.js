
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Model Runnable
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 2. Prompt Runnable
const prompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple words in 3 lines."
);

// 3. Output parser Runnable
const parser = new StringOutputParser();

// 4. Connect the Runnables
const chain = prompt | model | parser;

// 5. Execute the complete chain
const result = await chain.invoke({
  topic: "Artificial Intelligence",
});

console.log(result);
