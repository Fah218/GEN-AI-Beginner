
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnablePassthrough } from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const prompt = ChatPromptTemplate.fromTemplate(
  "Answer this question briefly: {question}"
);

const answerChain = prompt
  .pipe(model)
  .pipe(new StringOutputParser());

const chain = RunnablePassthrough.assign({
  answer: answerChain,
});

const result = await chain.invoke({
  question: "What is LangChain?",
  student: "Fahad",
});

console.log(result);
