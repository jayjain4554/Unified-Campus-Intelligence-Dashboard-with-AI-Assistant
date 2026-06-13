import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { CallToolRequestSchema, ListToolsRequestSchema } from "@modelcontextprotocol/sdk/types.js";
import { mockBooks } from "./mockData.js";

export const server = new Server(
  {
    name: "campus-library-mcp",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "searchBooks",
        description: "Search books by title, author, or category",
        inputSchema: {
          type: "object",
          properties: {
            query: { type: "string", description: "Search query string" },
          },
          required: ["query"],
        },
      },
      {
        name: "getBookAvailability",
        description: "Get detailed availability for a book by its ISBN",
        inputSchema: {
          type: "object",
          properties: {
            isbn: { type: "string", description: "ISBN identifier of the book" },
          },
          required: ["isbn"],
        },
      },
      {
        name: "getPopularBooks",
        description: "Retrieve popular books by score threshold or limit",
        inputSchema: {
          type: "object",
          properties: {
            limit: { type: "number", description: "Maximum number of books to return" },
          },
        },
      },
    ],
  };
});

server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "searchBooks": {
        const query = String(args?.query || "").toLowerCase();
        const results = mockBooks.filter(
          (b) =>
            b.title.toLowerCase().includes(query) ||
            b.author.toLowerCase().includes(query) ||
            b.category.toLowerCase().includes(query)
        );
        return {
          content: [{ type: "text", text: JSON.stringify(results) }],
        };
      }
      case "getBookAvailability": {
        const isbn = String(args?.isbn || "");
        const book = mockBooks.find((b) => b.isbn === isbn);
        if (!book) {
          return {
            isError: true,
            content: [{ type: "text", text: `Book with ISBN ${isbn} not found` }],
          };
        }
        return {
          content: [
            {
              type: "text",
              text: JSON.stringify({
                isbn: book.isbn,
                title: book.title,
                copiesAvailable: book.copiesAvailable,
                totalCopies: book.totalCopies,
                status: book.copiesAvailable > 0 ? "Available" : "Checked Out",
                locationShelf: book.locationShelf,
              }),
            },
          ],
        };
      }
      case "getPopularBooks": {
        const limit = Number(args?.limit || 3);
        const sorted = [...mockBooks]
          .sort((a, b) => b.popularityScore - a.popularityScore)
          .slice(0, limit);
        return {
          content: [{ type: "text", text: JSON.stringify(sorted) }],
        };
      }
      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (err: any) {
    return {
      isError: true,
      content: [{ type: "text", text: err.message || "An error occurred" }],
    };
  }
});
