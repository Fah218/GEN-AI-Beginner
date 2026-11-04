
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// STEP 1: API keys
const PINECONE_API_KEY = "PASTE_YOUR_PINECONE_API_KEY";
const GEMINI_API_KEY = "PASTE_YOUR_GEMINI_API_KEY";

// STEP 2: Connect to Pinecone
const pinecone = new Pinecone({
  apiKey: PINECONE_API_KEY,
});

const pineconeIndex = pinecone.Index("rag-learning");

// STEP 3: Initialize embeddings
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: GEMINI_API_KEY,
});

// STEP 4: Connect vector store
const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "rag-learning",
});

// STEP 5: Create MMR retriever
const retriever = vectorStore.asRetriever({
  k: 3,
  searchType: "mmr",
  searchKwargs: {
    fetchK: 10,
    lambda: 0.5,
  },
});

// STEP 6: User query
const query = "Explain Machine Learning and its applications";

// STEP 7: Retrieve diverse documents
const results = await retriever.invoke(query);

// STEP 8: Display results
results.forEach((doc, index) => {
  console.log(`\n----- RESULT ${index + 1} -----`);
  console.log(doc.pageContent);
  console.log("Metadata:", doc.metadata);
});
