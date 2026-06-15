# 🎓 Unified Campus Intelligence Dashboard

A full-stack, AI-powered campus information hub built with **Next.js**, **Model Context Protocol (MCP)**, and a **Turborepo** monorepo architecture. Students can ask natural-language questions and instantly get answers about their academics, cafeteria menus, library books, and upcoming campus events — all in one place.

---

## ✨ Features

- 🤖 **AI Assistant** — A rule-based agentic pipeline (Plan → Execute → Synthesize) that understands student queries
- 📚 **Library** — Search books and check availability via MCP
- 🍽️ **Cafeteria** — View daily menus with vegan/vegetarian filters
- 🗓️ **Events** — Browse upcoming hackathons, concerts, and campus events
- 🎓 **Academics** — Fetch GPA, class schedule, and handbook policies (with RAG over a PDF handbook)
- 🔄 **Fallback Mode** — Gracefully falls back to mock data when MCP servers are offline
- 📊 **Observability** — Built-in invocation metrics (latency, error rates) per MCP server
- 🚀 **Deployable** — Gateway ships to [Render](https://render.com), frontend to [Vercel](https://vercel.com)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│              Next.js Web App                │
│          (apps/web - Vercel)                │
│  ┌──────────────┐   ┌─────────────────────┐ │
│  │  Dashboard   │   │    AI Chat UI       │ │
│  │  (Library,   │   │  → /api/chat route  │ │
│  │  Cafeteria,  │   │                     │ │
│  │  Events,     │   └──────────┬──────────┘ │
│  │  Academics)  │              │            │
│  └──────────────┘              │            │
└───────────────────────────┬────┼────────────┘
                            │    │
                  ┌─────────▼────▼──────────┐
                  │    AI Assistant Package  │
                  │  Plan → Execute →        │
                  │    Synthesize            │
                  └──────────────┬──────────┘
                                 │ MCP over SSE
                  ┌──────────────▼──────────┐
                  │    MCP Gateway          │
                  │ (apps/mcp-gateway       │
                  │  Express + SSE          │
                  │  - Render deployed)     │
                  └──┬──────┬──────┬──────┬─┘
                     │      │      │      │
           ┌─────────┘  ┌───┘  ┌───┘  ┌──┘
           ▼            ▼      ▼      ▼
     [Library]  [Cafeteria] [Events] [Academics]
      :3001       :3002      :3003    :3004
```

---

## 📁 Project Structure

```
unified-campus-intelligence-dashboard/
├── apps/
│   ├── web/                        # Next.js 15 frontend (Vercel)
│   │   └── src/app/api/            # API routes (proxy to MCP tools)
│   ├── ai-assistant/               # Agentic AI pipeline package
│   │   └── src/agent/
│   │       ├── planner.ts          # Decomposes queries into tool calls
│   │       ├── executor.ts         # Dispatches parallel MCP calls
│   │       ├── synthesizer.ts      # Builds natural-language response
│   │       └── metrics.ts          # Per-server invocation metrics
│   ├── mcp-gateway/                # Express SSE gateway (Render)
│   │   └── src/index.ts            # Routes /library, /cafeteria, /events, /academics
│   └── mcp-servers/
│       ├── library/                # Library MCP Server (:3001)
│       ├── cafeteria/              # Cafeteria MCP Server (:3002)
│       ├── events/                 # Events MCP Server (:3003)
│       └── academics/              # Academics MCP Server (:3004)
│           └── src/rag/            # RAG pipeline (ChromaDB + PDF handbook)
├── packages/
│   ├── types/                      # Shared TypeScript types
│   ├── ui/                         # Shared React component library
│   ├── tailwind-config/            # Shared Tailwind configuration
│   └── typescript-config/          # Shared TS compiler options
├── turbo.json                      # Turborepo pipeline config
├── render.yaml                     # Render deployment config (gateway)
└── vercel.json                     # Vercel deployment config (web)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | Next.js 15, React 19, Tailwind CSS 3 |
| **AI Pipeline** | Custom Plan→Execute→Synthesize agent |
| **Protocol** | Model Context Protocol (MCP) `@modelcontextprotocol/sdk ^0.6.0` |
| **Transport** | SSE (Server-Sent Events) |
| **Gateway** | Express.js 5 |
| **RAG** | LangChain + ChromaDB (academics handbook) |
| **Monorepo** | Turborepo 2 |
| **Language** | TypeScript 5 |
| **Deploy (web)** | Vercel |
| **Deploy (gateway)** | Render |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** `>=18`
- **npm** `>=10`

### 1. Clone & Install

```bash
git clone https://github.com/jayjain4554/Unified-Campus-Intelligence-Dashboard-with-AI-Assistant.git
cd Unified-Campus-Intelligence-Dashboard-with-AI-Assistant
npm install
```

### 2. Build All Packages

```bash
npm run build
```

### 3. Start Development Servers

Run everything in parallel with Turborepo:

```bash
npm run dev
```

Or start individual services:

```bash
# Frontend (Next.js)
npm run dev --workspace=@campus-intelligence/web

# MCP Gateway
npm start --workspace=@campus-intelligence/mcp-gateway

# Individual MCP Servers
npm start --workspace=@campus-intelligence/mcp-library    # :3001
npm start --workspace=@campus-intelligence/mcp-cafeteria  # :3002
npm start --workspace=@campus-intelligence/mcp-events     # :3003
npm start --workspace=@campus-intelligence/mcp-academics  # :3004
```

### 4. Open the App

```
http://localhost:3000
```

---

## 🤖 AI Assistant Pipeline

The assistant uses a **3-phase agentic pipeline**:

```
User Query
    │
    ▼
┌──────────┐    Keyword-based    ┌────────────────────┐
│ Planner  │ ─────────────────► │  ExecutionPlan     │
│          │    intent matching  │  (list of tools    │
└──────────┘                    │   to invoke)       │
                                └─────────┬──────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │    Executor      │
                                │  (parallel MCP   │
                                │   tool calls)    │
                                └─────────┬────────┘
                                          │
                                          ▼
                                ┌──────────────────┐
                                │   Synthesizer    │
                                │  (markdown nat.  │
                                │   lang. answer)  │
                                └──────────────────┘
```

**Example queries:**
- *"What events are happening tomorrow and what vegan food is available?"*
- *"What is my GPA and class schedule?"*
- *"Is the Clean Code book available in the library?"*
- *"What is the university's attendance policy?"*

---

## 🔌 MCP Server Endpoints

All MCP servers are exposed via the **gateway** using SSE transport:

| Service | SSE Endpoint | Available Tools |
|---|---|---|
| Library | `GET /library/sse` | `searchBooks`, `getBookAvailability`, `getPopularBooks` |
| Cafeteria | `GET /cafeteria/sse` | `get_menu` |
| Events | `GET /events/sse` | `get_upcoming_events` |
| Academics | `GET /academics/sse` | `get_gpa`, `get_schedule`, `query_handbook` |

**Health check:**
```
GET /health
```

---

## 🎓 RAG — Academics Handbook

The **Academics MCP Server** supports PDF-based Q&A using a RAG pipeline:

1. **Ingest** — Parses `handbook.pdf`, chunks it with `RecursiveCharacterTextSplitter`, and stores embeddings in **ChromaDB**
2. **Query** — On `query_handbook` tool calls, retrieves relevant chunks and returns policy text

```bash
# Generate mock handbook PDF
npx ts-node apps/mcp-servers/academics/src/rag/mockPdfGenerator.ts

# Ingest into ChromaDB (requires ChromaDB running on :8000)
npx ts-node apps/mcp-servers/academics/src/rag/ingest.ts
```

> **Note:** The RAG system uses a `MockEmbeddings` class with a lightweight 384-dim vector. Swap in a real embedding model (e.g., `@xenova/transformers` or OpenAI) for production use.

---

## 🌍 Deployment

### Frontend → Vercel

```bash
# vercel.json is already configured
vercel deploy
```

### MCP Gateway → Render

The `render.yaml` is pre-configured:
```yaml
buildCommand: npm install && npx turbo run build --filter=@campus-intelligence/mcp-gateway
startCommand: npm start --workspace=@campus-intelligence/mcp-gateway
```

Set these environment variables on Render after deploying the MCP servers:

| Variable | Value |
|---|---|
| `LIBRARY_MCP_URL` | `https://your-library-server.onrender.com/sse` |
| `CAFETERIA_MCP_URL` | `https://your-cafeteria-server.onrender.com/sse` |
| `EVENTS_MCP_URL` | `https://your-events-server.onrender.com/sse` |
| `ACADEMICS_MCP_URL` | `https://your-academics-server.onrender.com/sse` |

> If env vars are not set, the executor falls back to `http://localhost:{port}/sse`.

---

## 📦 Shared Packages

| Package | Purpose |
|---|---|
| `@campus-intelligence/types` | Shared TypeScript interfaces (`ChatMessage`, `AssistantResponse`, `MenuItem`, etc.) |
| `@campus-intelligence/ui` | Shared React components |
| `@campus-intelligence/tailwind-config` | Base Tailwind config extended by all apps |
| `@campus-intelligence/typescript-config` | Shared `tsconfig` base files |

---

## 📊 Observability

The executor automatically records per-invocation metrics (accessible via `getMetrics()`):

```typescript
import { getMetrics } from "@campus-intelligence/ai-assistant";

const metrics = getMetrics();
// { library: { totalCalls, successCalls, errorCalls, avgDurationMs }, ... }
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m 'feat: add your feature'`
4. Push and open a Pull Request

---

## 📄 License

MIT © Jay Jain
