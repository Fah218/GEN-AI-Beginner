
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "fs/promises";

// Step 1: Read JavaScript file
const text = await readFile("./sample.js", "utf-8");

// Step 2: Create JavaScript splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,

  separators: [
    "\nclass ",       // Class
    "\nfunction ",    // Function
    "\nconst ",       // Variable declaration
    "\nlet ",         // Variable declaration
    "\nvar ",         // Variable declaration
    "\n\n",           // Paragraph / blank line
    "\n",             // Line
    " ",              // Word
    ""                // Character
  ],
});

// Step 3: Split JavaScript code
const chunks = await splitter.createDocuments([text]);

// Step 4: Display chunks
chunks.forEach((chunk, index) => {
  console.log(`\n----- CHUNK ${index + 1} -----`);
  console.log(chunk.pageContent);
});
