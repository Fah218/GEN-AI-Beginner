
import "dotenv/config";
import { GoogleGenerativeAI } from "@google/generative-ai";
import readlineSync from "readline-sync";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

const userInput = readlineSync.question("Enter your prompt: ");

async function main() {
  try {
    const result = await model.generateContent(userInput);
    const response = result.response.text();

    console.log("\nAI Response:\n");
    console.log(response);
  } catch (error) {
    console.error("Error:", error.message);
  }
}

main();
