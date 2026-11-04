
import { Pinecone } from "@pinecone-database/pinecone";
import { PineconeStore } from "@langchain/pinecone";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { Document } from "@langchain/core/documents";

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

// STEP 4: Connect vector store
const vectorStore = new PineconeStore(embeddings, {
  pineconeIndex,
  namespace: "rag-learning",
});

// STEP 5: Create base retriever
const baseRetriever = vectorStore.asRetriever({
  k: 5,
});

// STEP 6: Initialize Gemini model
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
  apiKey: GEMINI_API_KEY,
});

// STEP 7: Create compression prompt
const compressionPrompt = ChatPromptTemplate.fromTemplate(`
You are a contextual compression assistant.

Extract ONLY the information from the document
that is relevant to the user's question.

Rules:
- Keep the original wording as much as possible.
- Do not add new facts.
- Do not make up information.
- If nothing is relevant, return exactly:
  NO_RELEVANT_INFO

User Question:
{question}

Document:
{context}

Relevant Extract:
`);

// STEP 8: Create compression chain
const compressionChain = compressionPrompt
  .pipe(model)
  .pipe(new StringOutputParser());

// STEP 9: User question
const question = "What are the benefits of Machine Learning?";

// STEP 10: Retrieve original documents
const retrievedDocs = await baseRetriever.invoke(question);

console.log("Original retrieved documents:", retrievedDocs.length);

// STEP 11: Compress each document
const compressedResults = await Promise.all(
  retrievedDocs.map(async (doc) => {
    const compressedText = await compressionChain.invoke({
      question,
      context: doc.pageContent,
    });

    return new Document({
      pageContent: compressedText.trim(),
      metadata: doc.metadata,
    });
  })
);

// STEP 12: Remove irrelevant documents
const compressedDocs = compressedResults.filter(
  (doc) =>
    doc.pageContent &&
    doc.pageContent !== "NO_RELEVANT_INFO"
);

// STEP 13: Display compressed documents
console.log("\nCompressed documents:", compressedDocs.length);

compressedDocs.forEach((doc, index) => {
  console.log(`\n----- COMPRESSED RESULT ${index + 1} -----`);
  console.log(doc.pageContent);
  console.log("Metadata:", doc.metadata);
});
