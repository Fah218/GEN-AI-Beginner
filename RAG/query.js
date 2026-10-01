import * as dotenv from 'dotenv';
dotenv.config();
import readlineSync from 'readline-sync';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { GoogleGenAI } from '@google/genai';

const ai = new GoogleGenAI();
const History = [];

// Helper function to enhance user query
async function transformQuery(question) {
    const tempHistory = [...History];
    tempHistory.push({
        role: 'user',
        parts: [{ text: question }]
    });

    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: tempHistory,
        config: {
            systemInstruction: 'You are a query rewriting expert. Based on the conversation history, output the rewritten question to be searched in a vector database and nothing else. If the question is standalone, return it as is.'
        },
    });

    return response.text();
}

async function chatting(question) {
    // Enhance user query
    const enhancedQuery = await transformQuery(question);

    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });

    // Generate query vector
    const queryVector = await embeddings.embedQuery(enhancedQuery);

    // Make connection with Pinecone
    const pinecone = new Pinecone();
    const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME);

    const searchResults = await pineconeIndex.query({
        topK: 10,
        vector: queryVector,
        includeMetadata: true,
    });

    // Extract context from top documents
    const context = searchResults.matches
        .map(match => match.metadata.text)
        .join("\n\n---\n\n");

    // Add user question to history
    History.push({
        role: 'user',
        parts: [{ text: question }]
    });

    // Generate response using LLM with context
    const response = await ai.models.generateContent({
        model: "gemini-2.0-flash",
        contents: History,
        config: {
            systemInstruction: `You are a helpful AI assistant. Answer the user's question using the provided context from the knowledge base. Use the context whenever it is relevant to the user's question. If the answer is not available in the provided context, clearly say that you do not have enough information from the knowledge base. Do not make up or hallucinate information. Answer clearly and concisely.\n\nContext:\n${context}`
        },
    });

    const responseText = response.text();
    console.log(`\nAI: ${responseText}\n`);

    // Add model response to history
    History.push({
        role: 'model',
        parts: [{ text: responseText }]
    });
}

async function main() {
    while (true) {
        const userProblem = readlineSync.question("Ask me anything (or type 'exit' to quit): ");
        if (userProblem.toLowerCase() === 'exit') break;
        await chatting(userProblem);
    }
}

main();