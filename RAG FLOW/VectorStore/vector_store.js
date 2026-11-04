
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { Document } from "@langchain/core/documents";

// STEP 1: Paste your API keys
const PINECONE_API_KEY = "PASTE_YOUR_PINECONE_API_KEY";
const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY";

// STEP 2: Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

// STEP 3: Connect to your existing index
const pineconeIndex = pinecone.Index("rag-learning");

// STEP 4: Initialize Gemini embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: GEMINI_API_KEY,
});

// STEP 5: Create sample documents
const documents = [
  new Document({
    pageContent: "Machine Learning is a subset of Artificial Intelligence.",
    metadata: { source: "ai-notes.pdf", topic: "AI" },
  }),

  new Document({
    pageContent: "Deep Learning uses neural networks to learn complex patterns.",
    metadata: { source: "ai-notes.pdf", topic: "Deep Learning" },
  }),

  new Document({
    pageContent: "RAG combines information retrieval with Large Language Models.",
    metadata: { source: "rag-notes.pdf", topic: "RAG" },
  }),

  new Document({
    pageContent: "Pinecone is a vector database used to store and search embeddings.",
    metadata: { source: "rag-notes.pdf", topic: "Vector Database" },
  }),
];

// STEP 6: Connect LangChain with Pinecone
const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "rag-learning",
});

// STEP 7: Generate embeddings and store documents
await vectorStore.addDocuments(documents);

console.log("Documents successfully stored in Pinecone!");

// STEP 8: Search for similar documents
const question = "What is Retrieval Augmented Generation?";

const results = await vectorStore.similaritySearch(question, 2);

// STEP 9: Display search results
console.log("\nRelevant documents:");

results.forEach((doc, index) => {
  console.log(`\n----- RESULT ${index + 1} -----`);
  console.log("Content:", doc.pageContent);
  console.log("Metadata:", doc.metadata);
});
