
import "dotenv/config";
import { DirectoryLoader } from "@langchain/classic/document_loaders/fs/directory";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Load all PDF and TXT files from directory
const loader = new DirectoryLoader("./documents", {
  ".pdf": (path) => new PDFLoader(path),
  ".txt": (path) => new TextLoader(path),
});

// 2. Extract all documents
const docs = await loader.load();

console.log("Total documents/pages loaded:", docs.length);

// 3. Combine all extracted text
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
Answer the question using only the provided documents.
If the answer is unavailable, say so.

Documents:
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
  question: "What are the key points the battery energy system solution should address?",
});

console.log("\nAnswer:\n", result);
