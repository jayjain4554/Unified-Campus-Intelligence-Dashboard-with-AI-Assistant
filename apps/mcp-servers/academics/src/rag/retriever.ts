// @ts-nocheck
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { MockEmbeddings } from "./ingest.js";

export async function queryHandbook(question: string) {
  // Initialize embeddings model
  const embeddings = new MockEmbeddings();

  // Connect to the existing Chroma collection
  const vectorStore = new Chroma(embeddings, {
    collectionName: "academic_handbook",
    url: process.env.CHROMA_URL || "http://localhost:8000",
  });

  // Retrieve top 3 most similar chunks
  const results = await vectorStore.similaritySearch(question, 3);
  
  return results.map((doc: any) => ({
    pageContent: doc.pageContent,
    metadata: doc.metadata
  }));
}
