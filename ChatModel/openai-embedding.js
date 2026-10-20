
import 'dotenv/config';
import OpenAI from 'openai';
import readlineSync from 'readline-sync';
import { documents } from './doc.js';

const ai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

// Convert text into a vector.
async function embed(text) {
  const result = await ai.embeddings.create({
    model: 'text-embedding-3-large',
    input: text,
    dimensions: 32
  });

  return result.data[0].embedding;
}

// Calculate cosine similarity between two vectors.
function cosineSimilarity(a, b) {
  let dot = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dot += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dot / (Math.sqrt(normA) * Math.sqrt(normB));
}

// Embed each document paragraph once.
async function prepareDocuments() {
  for (const doc of documents) {
    doc.embedding = await embed(doc.text);
  }

  console.log('Document embeddings are ready.');
}

// Retrieve the most relevant paragraph.
async function retrieve(question) {
  const questionVector = await embed(question);

  const ranked = documents.map(doc => ({
    ...doc,
    score: cosineSimilarity(
      questionVector,
      doc.embedding
    )
  }));

  ranked.sort((a, b) => b.score - a.score);

  return ranked.slice(0, 2);
}

// Generate an answer using retrieved context.
async function answerQuestion(question) {
  const results = await retrieve(question);

  const context = results
    .map(doc => doc.text)
    .join('\n\n');

  console.log('\nRetrieved context:\n', context);

  const response = await ai.chat.completions.create({
    model: 'gpt-4.1-mini',
    messages: [
      {
        role: 'system',
        content: `Answer using only the supplied context.
If the answer is not present, say you cannot find it
in the document. Do not invent facts.

Context:
${context}`
      },
      {
        role: 'user',
        content: question
      }
    ],
    temperature: 0.2,
    max_completion_tokens: 300
  });

  console.log('\nAnswer:\n', response.choices[0].message.content);
}

async function main() {
  await prepareDocuments();

  while (true) {
    const question = readlineSync.question(
      '\nAsk a question (or type exit): '
    );

    if (question.trim().toLowerCase() === 'exit') break;

    try {
      await answerQuestion(question);
    } catch (error) {
      console.error('Error:', error.message);
    }
  }
}

main();
