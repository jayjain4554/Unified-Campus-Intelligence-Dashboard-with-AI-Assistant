import express from "express";
import { SSEServerTransport } from "@modelcontextprotocol/sdk/server/sse.js";
import { server as libraryServer } from "@campus-intelligence/mcp-library";
import { server as cafeteriaServer } from "@campus-intelligence/mcp-cafeteria";
import { server as eventsServer } from "@campus-intelligence/mcp-events";
import { server as academicsServer } from "@campus-intelligence/mcp-academics";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3000;

// Session maps to hold active transports for concurrency safety
const libraryTransports = new Map<string, SSEServerTransport>();
const cafeteriaTransports = new Map<string, SSEServerTransport>();
const eventsTransports = new Map<string, SSEServerTransport>();
const academicsTransports = new Map<string, SSEServerTransport>();

// Health status endpoint
app.get("/health", (req, res) => {
  res.json({
    status: "healthy",
    timestamp: new Date().toISOString(),
    services: ["library", "cafeteria", "events", "academics"]
  });
});

// Helper to handle client connection closed
function setupCloseHandler(req: any, map: Map<string, any>, sessionId: string) {
  req.on("close", () => {
    console.log(`Connection closed for session: ${sessionId}. Cleaning up.`);
    map.delete(sessionId);
  });
}

// 1. Library MCP Routing
app.get("/library/sse", async (req, res) => {
  console.log("Client connecting to Gateway -> Library SSE");
  const transport = new SSEServerTransport("/library/messages", res);
  const sessionId = transport.sessionId;
  libraryTransports.set(sessionId, transport);
  setupCloseHandler(req, libraryTransports, sessionId);
  await libraryServer.connect(transport);
});

app.post("/library/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = libraryTransports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send(`Library SSE Session not found: ${sessionId}`);
  }
});

// 2. Cafeteria MCP Routing
app.get("/cafeteria/sse", async (req, res) => {
  console.log("Client connecting to Gateway -> Cafeteria SSE");
  const transport = new SSEServerTransport("/cafeteria/messages", res);
  const sessionId = transport.sessionId;
  cafeteriaTransports.set(sessionId, transport);
  setupCloseHandler(req, cafeteriaTransports, sessionId);
  await cafeteriaServer.connect(transport);
});

app.post("/cafeteria/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = cafeteriaTransports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send(`Cafeteria SSE Session not found: ${sessionId}`);
  }
});

// 3. Events MCP Routing
app.get("/events/sse", async (req, res) => {
  console.log("Client connecting to Gateway -> Events SSE");
  const transport = new SSEServerTransport("/events/messages", res);
  const sessionId = transport.sessionId;
  eventsTransports.set(sessionId, transport);
  setupCloseHandler(req, eventsTransports, sessionId);
  await eventsServer.connect(transport);
});

app.post("/events/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = eventsTransports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send(`Events SSE Session not found: ${sessionId}`);
  }
});

// 4. Academics MCP Routing
app.get("/academics/sse", async (req, res) => {
  console.log("Client connecting to Gateway -> Academics SSE");
  const transport = new SSEServerTransport("/academics/messages", res);
  const sessionId = transport.sessionId;
  academicsTransports.set(sessionId, transport);
  setupCloseHandler(req, academicsTransports, sessionId);
  await academicsServer.connect(transport);
});

app.post("/academics/messages", async (req, res) => {
  const sessionId = req.query.sessionId as string;
  const transport = academicsTransports.get(sessionId);
  if (transport) {
    await transport.handlePostMessage(req, res);
  } else {
    res.status(400).send(`Academics SSE Session not found: ${sessionId}`);
  }
});

// Start unified express gateway
app.listen(PORT, () => {
  console.log(`Unified MCP Gateway running on http://localhost:${PORT}`);
  console.log(`Endpoints:`);
  console.log(`- Library:   http://localhost:${PORT}/library/sse`);
  console.log(`- Cafeteria: http://localhost:${PORT}/cafeteria/sse`);
  console.log(`- Events:    http://localhost:${PORT}/events/sse`);
  console.log(`- Academics: http://localhost:${PORT}/academics/sse`);
});
