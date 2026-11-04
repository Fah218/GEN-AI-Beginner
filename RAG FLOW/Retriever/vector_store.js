
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// STEP 1: Paste API keys
const PINECONE_API_KEY = "PASTE_YOUR_PINECONE_API_KEY";
const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY";

// STEP 2: Initialize Pinecone
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

// STEP 3: Connect to existing index
const pineconeIndex = pinecone.Index("rag-learning");

// STEP 4: Initialize embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: GEMINI_API_KEY,
});

// STEP 5: Connect LangChain with Pinecone
const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "rag-learning",
});

// STEP 6: Create a retriever
const retriever = vectorStore.asRetriever({
  k: 3,
});

// STEP 7: User query
const query = "What is Retrieval Augmented Generation?";

// STEP 8: Retrieve relevant documents
const results = await retriever.invoke(query);

// STEP 9: Display retrieved documents
console.log("Retrieved documents:", results.length);

results.forEach((doc, index) => {
  console.log(`\n----- RESULT ${index + 1} -----`);
  console.log("Content:", doc.pageContent);
  console.log("Metadata:", doc.metadata);
});
