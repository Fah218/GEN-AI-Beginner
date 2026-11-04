
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";

// STEP 1: API keys
const PINECONE_API_KEY = "PASTE_YOUR_PINECONE_API_KEY";
const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY";

// STEP 2: Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index("rag-learning");

// STEP 3: Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: GEMINI_API_KEY,
});

// STEP 4: Initialize vector store
const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "rag-learning",
});

// STEP 5: Create base retriever
const retriever = vectorStore.asRetriever({
  k: 3,
});

// STEP 6: Initialize Gemini chat model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: GEMINI_API_KEY,
});

// STEP 7: Create prompt to generate alternative queries
const prompt = ChatPromptTemplate.fromTemplate(`
You are an AI assistant.

Generate 3 different search queries
for the user's question.

Keep each query on a separate line.
Do not add numbering or explanations.

Original question: {question}
`);

// STEP 8: Create query generation chain
const queryChain = prompt
  .pipe(model)
  .pipe(new StringOutputParser());

// STEP 9: Original user question
const question = "What is RAG?";

// STEP 10: Generate multiple queries
const generatedQueries = await queryChain.invoke({
  question,
});

const queries = [
  question,
  ...generatedQueries
    .split("\n")
    .map((q) => q.replace(/^\d+[\).\s]*/, "").trim())
    .filter(Boolean),
];

console.log("Generated queries:", queries);

// STEP 11: Search all queries in parallel
const allResults = await Promise.all(
  queries.map((query) => retriever.invoke(query))
);

// STEP 12: Combine all documents
const combinedResults = allResults.flat();

// STEP 13: Remove duplicate documents
const uniqueResults = [
  ...new Map(
    combinedResults.map((doc) => [
      `${doc.metadata.source ?? ""}:${doc.pageContent}`,
      doc,
    ])
  ).values(),
];

// STEP 14: Display final results
console.log("\nTotal unique documents:", uniqueResults.length);

uniqueResults.forEach((doc, index) => {
  console.log(`\n----- RESULT ${index + 1} -----`);
  console.log(doc.pageContent);
  console.log("Metadata:", doc.metadata);
});
