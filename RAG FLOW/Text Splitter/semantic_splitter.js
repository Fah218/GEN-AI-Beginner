
import "dotenv/config";

import { SemanticChunker } from "@langchain/community/experimental/text_splitter";
import { GoogleGenerativeAIEmbeddings } from "@langchain/google-genai";

// Step 1: Create embedding model
const embeddings = new GoogleGenerativeAIEmbeddings({
  model: "gemini-embedding-001",
  apiKey: process.env.GEMINI_API_KEY,
});

// Step 2: Create semantic splitter
const splitter = new SemanticChunker(embeddings, {
  breakpointThresholdType: "percentile",
  breakpointThresholdAmount: 95,
});

// Step 3: Sample document
const text = `
Artificial Intelligence is a field of computer science.
Machine Learning is a subset of Artificial Intelligence.
Deep Learning uses neural networks to learn complex patterns.

Python is a popular programming language.
It is widely used in data science and automation.
Python provides libraries such as NumPy and Pandas.

RAG stands for Retrieval Augmented Generation.
It combines information retrieval with Large Language Models.
It helps LLMs answer questions using external knowledge.
`;

// Step 4: Generate semantic chunks
const chunks = await splitter.createDocuments([text]);

// Step 5: Display chunks
chunks.forEach((chunk, index) => {
  console.log(`\n----- CHUNK ${index + 1} -----`);
  console.log(chunk.pageContent);
});
