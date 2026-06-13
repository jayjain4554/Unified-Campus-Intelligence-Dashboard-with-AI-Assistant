// @ts-nocheck
import { Chroma } from "@langchain/community/vectorstores/chroma";
import { RecursiveCharacterTextSplitter } from "langchain/text_splitter";
import { Embeddings } from "@langchain/core/embeddings";
import * as fs from "fs";
import * as path from "path";
const pdfParse = require("pdf-parse");
export class MockEmbeddings extends Embeddings {
    constructor() { super({}); }
    async embedDocuments(texts) {
        return Promise.all(texts.map(t => this.embedQuery(t)));
    }
    async embedQuery(text) {
        const vec = new Array(384).fill(0);
        const lower = text.toLowerCase();
        if (lower.includes("attendance") || lower.includes("absenc"))
            vec[0] = 1;
        else if (lower.includes("fail") || lower.includes("probation"))
            vec[1] = 1;
        else
            vec[2] = 1;
        return vec;
    }
}
async function ingestHandbook() {
    const pdfPath = path.resolve(process.cwd(), "apps/mcp-servers/academics/handbook.pdf");
    if (!fs.existsSync(pdfPath)) {
        console.error("Handbook PDF not found. Please run mockPdfGenerator.ts first.");
        process.exit(1);
    }
    console.log("Reading PDF...");
    const dataBuffer = fs.readFileSync(pdfPath);
    const data = await pdfParse(dataBuffer);
    const text = data.text;
    console.log("Chunking text...");
    const splitter = new RecursiveCharacterTextSplitter({
        chunkSize: 500,
        chunkOverlap: 100,
    });
    const docs = await splitter.createDocuments([text], [{ source: "Student Handbook 2026" }]);
    console.log(`Created ${docs.length} chunks.`);
    console.log("Initializing local ChromaDB and embedding model...");
    const embeddings = new MockEmbeddings();
    console.log("Storing chunks in ChromaDB...");
    await Chroma.fromDocuments(docs, embeddings, {
        collectionName: "academic_handbook",
        url: process.env.CHROMA_URL || "http://localhost:8000",
    });
    console.log("Ingestion complete!");
}
ingestHandbook().catch(console.error);
