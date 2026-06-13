import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { SSEClientTransport } from "@modelcontextprotocol/sdk/client/sse.js";
import { ExecutionPlan, ExecutionContext, ExecutionResult } from "./types.js";
import { recordInvocation } from "./metrics.js";

export const PORTS = {
  library: 3001,
  cafeteria: 3002,
  events: 3003,
  academics: 3004,
};

const fallbackMockData = {
  academics: {
    gpa: { studentId: "std-123", gpa: 3.85, totalCreditsEarned: 96, gradesHistory: [
      { courseId: "CS-101", courseName: "Introduction to Computer Science", grade: "A", credits: 4, semester: "Fall 2024" },
      { courseId: "CS-201", courseName: "Data Structures", grade: "A-", credits: 4, semester: "Spring 2025" }
    ]},
    schedule: [
      { courseId: "CS-401", courseName: "Artificial Intelligence", instructor: "Dr. Evelyn Vance", room: "Tech Hall 302", days: ["Monday", "Wednesday"], startTime: "10:00 AM", endTime: "11:15 AM" },
      { courseId: "CS-402", courseName: "Database Systems", instructor: "Prof. Alan Turing", room: "Science Lab 101", days: ["Tuesday", "Thursday"], startTime: "01:00 PM", endTime: "02:15 PM" }
    ]
  },
  cafeteria: [
    { id: "m-001", name: "Vegan Quinoa Bowl", price: 8.50, allergens: [], isVegetarian: true, isVegan: true, availability: true },
    { id: "m-002", name: "Grilled Chicken Breast", price: 10.00, allergens: [], isVegetarian: false, isVegan: false, availability: true },
    { id: "m-101", name: "Belgian Waffles", price: 6.50, allergens: ["Gluten", "Dairy"], isVegetarian: true, isVegan: false, availability: true }
  ],
  events: [
    { id: "evt-001", title: "AI Hackathon 2026", description: "Build the next gen agents.", category: "Academic", startTime: "2026-06-12T10:00:00Z", endTime: "2026-06-14T18:00:00Z", location: { buildingName: "Engineering Center", room: "Hall A" }, organizer: "CS Dept", rsvpCount: 120 }
  ],
  library: [
    { isbn: "978-0131103627", title: "The C Programming Language", author: "Brian Kernighan", category: "Computer Science", available: true, locationShelf: "CS-01-A", copiesAvailable: 3, totalCopies: 4 },
    { isbn: "978-0132350884", title: "Clean Code", author: "Robert C. Martin", category: "Software Engineering", available: false, locationShelf: "SE-03-A", copiesAvailable: 0, totalCopies: 3 }
  ]
};

export async function callMCPTool(serverKey: keyof typeof PORTS, toolName: string, args: Record<string, any>): Promise<any> {
  const envKey = `${serverKey.toUpperCase()}_MCP_URL`;
  const url = process.env[envKey] || `http://localhost:${PORTS[serverKey]}/sse`;
  try {
    const transport = new SSEClientTransport(new URL(url));
    const client = new Client(
      { name: "ai-assistant-client", version: "1.0.0" },
      { capabilities: {} }
    );
    
    const connectPromise = client.connect(transport);
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error("Timeout")), 1500));
    
    await Promise.race([connectPromise, timeoutPromise]);
    const response = (await client.callTool({ name: toolName, arguments: args })) as any;
    
    try {
      await transport.close();
    } catch {}

    if (response && response.content && response.content[0] && response.content[0].type === "text") {
      return JSON.parse(response.content[0].text);
    }
    return response;
  } catch (error) {
    console.warn(`[MCP Connection Fallback] Server ${serverKey} at ${url} is offline or timed out. Using mock data.`, error);
    
    if (serverKey === "academics") {
      return toolName === "get_gpa" ? fallbackMockData.academics.gpa : fallbackMockData.academics.schedule;
    }
    if (serverKey === "cafeteria") {
      return fallbackMockData.cafeteria;
    }
    if (serverKey === "events") {
      return fallbackMockData.events;
    }
    if (serverKey === "library") {
      if (toolName === "searchBooks") {
        const query = String(args.query || "").toLowerCase();
        return fallbackMockData.library.filter(
          (b) => b.title.toLowerCase().includes(query) || b.author.toLowerCase().includes(query)
        );
      }
      if (toolName === "getBookAvailability") {
        return fallbackMockData.library.find((b) => b.isbn === args.isbn) || { error: "Not found" };
      }
      return fallbackMockData.library.slice(0, args.limit || 3);
    }
    return null;
  }
}

/**
 * Executes a plan by dispatching parallel requests to multiple MCP servers.
 */
export async function executePlan(plan: ExecutionPlan): Promise<ExecutionContext> {
  const results: ExecutionResult[] = await Promise.all(
    plan.toolsToInvoke.map(async (tool: any) => {
      const startTime = Date.now();
      try {
        const data = await callMCPTool(tool.serverKey, tool.toolName, tool.args);
        const durationMs = Date.now() - startTime;
        
        let recordsReturned = 1;
        if (Array.isArray(data)) {
          recordsReturned = data.length;
        } else if (data && typeof data === "object" && Array.isArray(data.gradesHistory)) {
          // specific case for grades response structure
          recordsReturned = data.gradesHistory.length;
        } else if (data === null || data === undefined) {
          recordsReturned = 0;
        }
        
        recordInvocation(tool.serverKey, tool.toolName, durationMs, false);
        return { tool, data, durationMs, recordsReturned };
      } catch (err: any) {
        const durationMs = Date.now() - startTime;
        recordInvocation(tool.serverKey, tool.toolName, durationMs, true);
        return { tool, data: null, error: err.message, durationMs, recordsReturned: 0 };
      }
    })
  );

  return { results };
}
