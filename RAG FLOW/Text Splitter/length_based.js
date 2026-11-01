
import { CharacterTextSplitter } from "@langchain/textsplitters";

// Sample document
const text = `
Artificial Intelligence is transforming the world.
Machine Learning is a subset of Artificial Intelligence.
Deep Learning is a subset of Machine Learning.

RAG stands for Retrieval Augmented Generation.
It combines information retrieval with Large Language Models.
RAG helps LLMs answer questions using external knowledge.

LangChain is a framework used to build applications
powered by Large Language Models.
`;

// Create a text splitter
const splitter = new CharacterTextSplitter({
  separator: "\n",
  chunkSize: 100,
  chunkOverlap: 20,
});

// Split the text
const chunks = await splitter.createDocuments([text]);

// Display the chunks
chunks.forEach((chunk, index) => {
  console.log(`\n----- CHUNK ${index + 1} -----`);
  console.log(chunk.pageContent);
});
