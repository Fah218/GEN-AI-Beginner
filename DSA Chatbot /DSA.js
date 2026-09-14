import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({});

async function main() {
  const interaction = await ai.interactions.create({
    model: "gemini-3.8-flash",
    input: "what is array",
    system_instruction: "You are a DSA instructore make sure u give the answer related to only DSA problem solving else reply sorry for other question example user ask for the What is Linked List then give him simple answer and key points and one exaple make sure ur answer should be very short ",
  });
  console.log(interaction.output_text);
}

await main();