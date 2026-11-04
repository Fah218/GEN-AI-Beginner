
import { RunnableLambda } from "@langchain/core/runnables";
import { Document } from "@langchain/core/documents";

// Step 1: Create a Wikipedia-backed retriever
const wikipediaRetriever = new RunnableLambda({
  func: async (query) => {
    // Search Wikipedia and retrieve article extracts
    const url = new URL("https://en.wikipedia.org/w/api.php");

    url.search = new URLSearchParams({
      action: "query",
      generator: "search",
      gsrsearch: query,
      gsrlimit: "3",
      prop: "extracts|info",
      exintro: "1",
      explaintext: "1",
      inprop: "url",
      format: "json",
      origin: "*",
    }).toString();

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Wikipedia API error: ${response.status}`);
    }

    const data = await response.json();

    // Step 2: Get matching Wikipedia pages
    const pages = Object.values(data.query?.pages ?? {});

    // Step 3: Convert results into LangChain Documents
    const documents = pages
      .sort((a, b) => a.index - b.index)
      .map((page) => new Document({
        pageContent: page.extract || "",
        metadata: {
          title: page.title,
          source: page.fullurl,
          pageId: page.pageid,
        },
      }))
      .filter((doc) => doc.pageContent.trim().length > 0);

    return documents;
  },
});

// Step 4: Ask a question
const query = "Artificial Intelligence";

// Step 5: Retrieve relevant Wikipedia documents
const results = await wikipediaRetriever.invoke(query);

// Step 6: Display results
console.log("Retrieved documents:", results.length);

results.forEach((doc, index) => {
  console.log(`\n----- RESULT ${index + 1} -----`);
  console.log("Title:", doc.metadata.title);
  console.log("Content:", doc.pageContent);
  console.log("Source:", doc.metadata.source);
});
