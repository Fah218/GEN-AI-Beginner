
import "dotenv/config";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// 1. Load the text file
const loader = new TextLoader("./college.txt");
const docs = await loader.load();

// 2. Get the document text
const documentText = docs
  .map((doc) => doc.pageContent)
  .join("\n");

// 3. Create the model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 4. Create the prompt
const prompt = ChatPromptTemplate.fromTemplate(`
Answer the question using only the following document.

Document:
{context}

Question:
{question}
`);

// 5. Create the output parser
const parser = new StringOutputParser();

// 6. Connect the components
const chain = prompt | model | parser;

// 7. Ask a question about the document
const result = await chain.invoke({
  context: documentText,
  question: "How can students get academic support?",
});

console.log(result);
