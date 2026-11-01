
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { readFile } from "fs/promises";

// Step 1: Read Markdown file
const text = await readFile("./notes.md", "utf-8");

// Step 2: Create Markdown splitter
const splitter = new RecursiveCharacterTextSplitter({
  chunkSize: 300,
  chunkOverlap: 50,

  separators: [
    "\n# ",       // Heading 1
    "\n## ",      // Heading 2
    "\n### ",     // Heading 3
    "\n\n",       // Paragraph
    "\n",         // Line
    " ",          // Word
    ""            // Character
  ],
});

// Step 3: Split Markdown text
const chunks = await splitter.createDocuments([text]);

// Step 4: Display chunks
chunks.forEach((chunk, index) => {
  console.log(`\n----- CHUNK ${index + 1} -----`);
  console.log(chunk.pageContent);
});
