
import { RunnableBranch } from "@langchain/core/runnables";
import { RunnableLambda } from "@langchain/core/runnables";

// Branch 1: Marks >= 80
const excellentBranch = RunnableLambda.from((input) => {
  return `Excellent! You scored ${input.marks} marks.`;
});

// Branch 2: Marks >= 40
const passBranch = RunnableLambda.from((input) => {
  return `You passed with ${input.marks} marks.`;
});

// Default branch: Marks < 40
const failBranch = RunnableLambda.from((input) => {
  return `You failed with ${input.marks} marks. Keep practicing!`;
});

// Create conditional branches
const resultChain = RunnableBranch.from([
  [
    (input) => input.marks >= 80,
    excellentBranch,
  ],
  [
    (input) => input.marks >= 40,
    passBranch,
  ],
  failBranch, // Default branch
]);

// Execute the chain
const result = await resultChain.invoke({
  marks: 75,
});

console.log(result);
