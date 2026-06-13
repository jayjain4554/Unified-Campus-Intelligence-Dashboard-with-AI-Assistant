import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./server.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3003;

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  console.log("Client connected to Events SSE endpoint");
  transport = new SSEServerTransport("/messages", res);
  await server.connect(transport);
});

app.post("/messages", async (req, res) => {
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send("No active SSE session");
  }
});

app.listen(PORT, () => {
  console.log(`Events MCP server running on http://localhost:${PORT}`);
});
