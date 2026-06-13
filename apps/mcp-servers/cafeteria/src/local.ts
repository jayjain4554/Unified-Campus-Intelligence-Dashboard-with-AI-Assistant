import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server } from "./server.js";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3002;

let transport: SSEServerTransport | null = null;

app.get("/sse", async (req, res) => {
  console.log("Client connected to Cafeteria SSE endpoint");
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
  console.log(`Cafeteria MCP server running on http://localhost:${PORT}`);
});
