import * as dotenv from 'dotenv';
dotenv.config();
import { PDFLoader } from '@langchain/community/document_loaders/fs/pdf';
import { RecursiveCharacterTextSplitter } from '@langchain/textsplitters';
import { GoogleGenerativeAIEmbeddings } from '@langchain/google-genai';
import { Pinecone } from '@pinecone-database/pinecone';
import { PineconeStore } from '@langchain/pinecone';

// DO THE CONFIGURATION - Step 01, Step 02, Step 03, Step 04
// Step 01 - Load the pdf

async function indexDocument(params) {
    const PDF_PATH = './Infosys Springboard Problem statement.pdf';
    const pdfLoader = new PDFLoader(PDF_PATH);
    const rawDocs = await pdfLoader.load();

    console.log("PDF loaded");

    // Step 02 - Do the Chunking 
    const textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: 1000,
        chunkOverlap: 200,
    });
    const chunkedDocs = await textSplitter.splitDocuments(rawDocs);

    console.log("Chunking completed");

    // Step 03 - Vectors embeddings models
    const embeddings = new GoogleGenerativeAIEmbeddings({
        apiKey: process.env.GEMINI_API_KEY,
        model: 'text-embedding-004',
    });

    console.log("Embedding model configured");

    // Step 04 - Configure the Database
    // Initialize the Pinecone Client
    const pineCone = new Pinecone();
    const pineconeIndex = pineCone.Index(process.env.PINECONE_INDEX_NAME);

    console.log("Pinecone configured");

    // Langchain (chunking, embedding, database)
    await PineconeStore.fromDocuments(chunkedDocs, embeddings, {
        pineconeIndex,
        maxConcurrency: 5
    });

    console.log("Data stored successfully");
}

indexDocument();