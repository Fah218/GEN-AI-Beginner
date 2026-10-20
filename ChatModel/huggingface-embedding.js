
import 'dotenv/config';
import { InferenceClient } from '@huggingface/inference';
import readlineSync from 'readline-sync';
import { documents } from './doc.js';

const ai = new InferenceClient(process.env.HF_TOKEN);

async function embed(text) {
  const result = await ai.featureExtraction({
    model: 'sentence-transformers/all-MiniLM-L6-v2',
    inputs: text
  });

  // The model returns one vector for a single text input.
  return result;
}

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

async function prepareDocuments() {
  for (const doc of documents) {
    doc.embedding = await embed(doc.text);
  }

  console.log('Document embeddings are ready.');
}

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

async function answerQuestion(question) {
  const results = await retrieve(question);

  const context = results
    .map(doc => doc.text)
    .join('\n\n');

  console.log('\nRetrieved context:\n', context);

  const response = await ai.chatCompletion({
    model: 'TinyLlama/TinyLlama-1.1B-Chat-v1.0',
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
    max_tokens: 300
  });

  console.log(
    '\nAnswer:\n',
    response.choices[0].message.content
  );
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
