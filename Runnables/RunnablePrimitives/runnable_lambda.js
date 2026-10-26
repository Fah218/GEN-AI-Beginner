
import { RunnableLambda } from "@langchain/core/runnables";

// Create a custom function as a Runnable
const uppercaseRunnable = RunnableLambda.from((input) => {
  return input.text.toUpperCase();
});

// Execute the Runnable
const result = await uppercaseRunnable.invoke({
  text: "learning langchain runnables",
});

console.log(result);
