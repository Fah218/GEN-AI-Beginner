
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// 1. Create loader
const loader = new PDFLoader(
  "./documents/battery_energy_system.pdf"
);

// 2. Load all pages at once
const docs = await loader.load();

// 3. Display total pages
console.log("Total pages:", docs.length);

// 4. Display content of each page
docs.forEach((doc, index) => {
  console.log(`\nPage ${index + 1}:`);
  console.log(doc.pageContent);
});
