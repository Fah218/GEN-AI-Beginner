import "dotenv/config";
import { GoogleGenAI } from "@google/genai";
import express from "express";

const ai = new GoogleGenAI({});

const app = express();
app.use(express.json());
app.use(express.static("public"));

app.post("/chat", async (req, res) => {
  try {
    const { message } = req.body;
    
    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const interaction = await ai.interactions.create({
      model: "gemini-3.8-flash",
      input: message,
      system_instruction: "You are a DSA instructore make sure u give the answer related to only DSA problem solving else reply sorry for other question example user ask for the What is Linked List then give him simple answer and key points and one exaple make sure ur answer should be very short ",
    });
    
    res.json({ reply: interaction.output_text });
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    res.status(500).json({ error: "Failed to fetch response" });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});