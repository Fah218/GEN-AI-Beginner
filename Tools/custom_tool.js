import "dotenv/config";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { tool } from "@langchain/core/tools";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";
import { z } from "zod";

// 1. Create your own custom tool
const calculatorTool = tool(
  async ({ a, b, operation }) => {
    switch (operation) {
      case "add":
        return a + b;

      case "subtract":
        return a - b;

      case "multiply":
        return a * b;

      case "divide":
        if (b === 0) {
          return "Cannot divide by zero";
        }
        return a / b;

      default:
        return "Invalid operation";
    }
  },
  {
    name: "calculator",
    description: "Performs basic mathematical calculations.",
    schema: z.object({
      a: z.number().describe("First number"),
      b: z.number().describe("Second number"),
      operation: z
        .enum(["add", "subtract", "multiply", "divide"])
        .describe("Mathematical operation"),
    }),
  }
);

// 2. Initialize Gemini
const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// 3. Bind custom tool to Gemini
const modelWithTools = model.bindTools([calculatorTool]);

const question = "Multiply 25 by 4";

const aiMessage = await modelWithTools.invoke(question);

console.log("Tool calls:", aiMessage.tool_calls);

// 4. Execute the tool
if (aiMessage.tool_calls?.length) {
  const toolCall = aiMessage.tool_calls[0];

  const result = await calculatorTool.invoke(toolCall.args);

  console.log("Calculator result:", result);

  // 5. Send result back to Gemini
  const toolMessage = new ToolMessage({
    content: String(result),
    tool_call_id: toolCall.id,
  });

  const finalResponse = await modelWithTools.invoke([
    new HumanMessage(question),
    aiMessage,
    toolMessage,
  ]);

  console.log("Final answer:", finalResponse.content);
} else {
  console.log("Answer:", aiMessage.content);
}