
import "dotenv/config";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Load PDF manually
const loader = new PDFLoader("./documents/battery_energy_system.pdf");

// 2. Extract PDF content
const docs = await loader.load();

console.log("Total pages:", docs.length);

// 3. Combine all page content
const context = docs
  .map((doc) => doc.pageContent)
  .join("\n\n");

// 4. Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 5. Create prompt template
const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question using only the given PDF content.
If the answer is not available, say so.

PDF Content:
{context}

Question:
{question}
`);

// 6. Output parser
const parser = new StringOutputParser();

// 7. Connect the chain
const chain = prompt | model | parser;

// 8. Ask a question
const result = await chain.invoke({
  context,
  question: "What is the main goal of this battery energy system project?",
});

console.log("\nAnswer:\n", result);
