
import "dotenv/config";
import { CheerioWebBaseLoader } from "@langchain/community/document_loaders/web/cheerio";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Website URL
const url = "https://en.wikipedia.org/wiki/Retrieval-augmented_generation";

// 2. Create web loader
const loader = new CheerioWebBaseLoader(url);

// 3. Load website content
const docs = await loader.load();

console.log("Total documents loaded:", docs.length);

// 4. Extract website text
const context = docs
  .map((doc) => doc.pageContent)
  .join("\n\n");

// 5. Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 6. Create prompt template
const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question using only the website content.
If the answer is unavailable, say so.

Website Content:
{context}

Question:
{question}
`);

// 7. Create output parser
const parser = new StringOutputParser();

// 8. Connect the chain
const chain = prompt | model | parser;

// 9. Ask a question
const result = await chain.invoke({
  context,
  question: "What is Retrieval-Augmented Generation?",
});

console.log("\nAnswer:\n", result);
