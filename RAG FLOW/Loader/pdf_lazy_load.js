
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf";

// 1. Create loader
const loader = new PDFLoader(
  "./documents/battery_energy_system.pdf"
);

// 2. Load documents one by one
for await (const doc of loader.lazyLoad()) {
  console.log("\nPage:", doc.metadata.loc?.pageNumber);
  console.log(doc.pageContent);
}
