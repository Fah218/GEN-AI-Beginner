import "dotenv/config";

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { WikipediaQueryRun } from "@langchain/community/tools/wikipedia_query";
import { HumanMessage, ToolMessage } from "@langchain/core/messages";

const model = new ChatGoogleGenerativeAI({
  model: "gemini-2.5-flash",
  temperature: 0,
});

// Prebuilt Wikipedia tool
const wikipediaTool = new WikipediaQueryRun({
  topKResults: 2,
});

// Give the tool definition to Gemini
const modelWithTools = model.bindTools([wikipediaTool]);

const question = "Who is Alan Turing?";

const aiMessage = await modelWithTools.invoke(question);

console.log("LLM tool calls:", aiMessage.tool_calls);

if (aiMessage.tool_calls?.length) {
  const toolCall = aiMessage.tool_calls[0];

  // Execute the tool with the arguments selected by Gemini
  const toolResult = await wikipediaTool.invoke(toolCall.args);

  console.log("Wikipedia result:", toolResult);

  // Send the tool result back to Gemini
  const toolMessage = new ToolMessage({
    content: String(toolResult),
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