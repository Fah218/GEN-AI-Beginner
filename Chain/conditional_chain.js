
import "dotenv/config";
import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { StringOutputParser } from "@langchain/core/output_parsers";
import {
  RunnableBranch,
  RunnableLambda,
  RunnablePassthrough,
} from "@langchain/core/runnables";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

const parser = new StringOutputParser();

// Step 1: Classify customer feedback
const sentimentPrompt = ChatPromptTemplate.fromTemplate(`
Classify the following customer feedback as exactly one word:
Positive or Negative.

Feedback: {feedback}

Sentiment:
`);

const sentimentChain = sentimentPrompt
  .pipe(model)
  .pipe(parser);

// Step 2: Positive branch
const positiveChain = RunnableLambda.from((input) => {
  return `
Sentiment: ${input.sentiment}

Thank you for your valuable feedback!
We're happy to know that you had a great experience.
We look forward to serving you again.
`;
});

// Step 3: Negative branch - prepare an email
const emailPrompt = ChatPromptTemplate.fromTemplate(`
Write a polite, empathetic email responding to this
customer's negative feedback.

Customer email: {customerEmail}
Feedback: {feedback}

Include a subject, apologize for their experience,
and ask how we can make things right.
`);

const emailChain = emailPrompt
  .pipe(model)
  .pipe(parser);

// Step 4: Preserve input and add the sentiment
const feedbackChain = RunnablePassthrough.assign({
  sentiment: sentimentChain,
});

// Step 5: Route to the correct branch
const conditionalChain = feedbackChain.pipe(
  RunnableBranch.from([
    [
      (input) =>
        input.sentiment.trim().toLowerCase().startsWith("positive"),
      positiveChain,
    ],
    [
      () => true,
      emailChain,
    ],
  ])
);

// Step 6: Run the chain
const result = await conditionalChain.invoke({
  feedback: "The service was excellent and the staff were very helpful!",
  customerEmail: "customer@example.com",
});

console.log("\nResult:\n");
console.log(result);
