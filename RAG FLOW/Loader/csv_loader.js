
import "dotenv/config";
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Create CSV loader
const loader = new CSVLoader("./students.csv");

// 2. Load CSV data
const docs = await loader.load();

console.log("Total rows loaded:", docs.length);

// 3. Display each document
docs.forEach((doc, index) => {
  console.log(`\nRow ${index + 1}:`);
  console.log(doc.pageContent);
});

// 4. Combine all rows
const context = docs
  .map((doc) => doc.pageContent)
  .join("\n\n");

// 5. Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 6. Create prompt
const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question using only the CSV data.

CSV Data:
{context}

Question:
{question}
`);

// 7. Create parser
const parser = new StringOutputParser();

// 8. Connect the chain
const chain = prompt | model | parser;

// 9. Ask a question
const result = await chain.invoke({
  context,
  question: "Which branch does Fahad belong to?",
});

console.log("\nAnswer:\n", result);
