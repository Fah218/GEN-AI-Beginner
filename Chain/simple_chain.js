
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromTemplate(
  "Explain {topic} in simple language with one example."
);

const parser = new StringOutputParser();

const chain = prompt
  | model
  | parser;

const result = await chain.invoke({
  topic: "Binary Search",
});

console.log(result);
