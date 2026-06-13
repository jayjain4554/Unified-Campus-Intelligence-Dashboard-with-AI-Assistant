import { ChatMessage } from "@campus-intelligence/types";
import { ExecutionPlan, ToolInvocation } from "./types.js";

/**
 * Decomposes a natural language query into an array of discrete tool invocations.
 * This simulates an LLM parsing step.
 */
export async function decomposeQuery(message: ChatMessage): Promise<ExecutionPlan> {
  const query = message.content.toLowerCase();
  const toolsToInvoke: ToolInvocation[] = [];

  // Simulate LLM extracting the "Academics" intent
  if (query.includes("gpa") || query.includes("grade") || query.includes("transcript") || query.includes("credits")) {
    toolsToInvoke.push({ serverKey: "academics", toolName: "get_gpa", args: { studentId: "std-123" }, reason: "Academics MCP selected because query mentions GPA or grades" });
  }
  if (query.includes("schedule") || query.includes("class") || query.includes("timetable")) {
    toolsToInvoke.push({ serverKey: "academics", toolName: "get_schedule", args: { studentId: "std-123" }, reason: "Academics MCP selected because query mentions class schedules" });
  }
  if (query.includes("policy") || query.includes("rule") || query.includes("handbook") || query.includes("fail") || query.includes("attendance")) {
    toolsToInvoke.push({ serverKey: "academics", toolName: "query_handbook", args: { query }, reason: "Academics MCP selected because query asks about university policies or handbook" });
  }

  // Simulate LLM extracting the "Cafeteria" intent
  if (query.includes("food") || query.includes("menu") || query.includes("cafeteria") || query.includes("eat") || query.includes("lunch") || query.includes("dinner") || query.includes("breakfast") || query.includes("vegan")) {
    let mealType = "Lunch";
    if (query.includes("breakfast")) mealType = "Breakfast";
    if (query.includes("dinner")) mealType = "Dinner";
    
    toolsToInvoke.push({ 
      serverKey: "cafeteria", 
      toolName: "get_menu", 
      args: { date: "2026-06-10", mealType, isVeganOnly: query.includes("vegan") },
      reason: "Cafeteria MCP selected because query mentions food or cafeteria menus"
    });
  }

  // Simulate LLM extracting the "Events" intent
  if (query.includes("event") || query.includes("hackathon") || query.includes("concert") || query.includes("social") || query.includes("career") || query.includes("what is happening") || query.includes("upcoming") || query.includes("tomorrow")) {
    toolsToInvoke.push({ serverKey: "events", toolName: "get_upcoming_events", args: { limit: 3 }, reason: "Events MCP selected because query mentions events or activities" });
  }

  // Simulate LLM extracting the "Library" intent
  if (query.includes("book") || query.includes("library") || query.includes("read") || query.includes("clean code") || query.includes("c programming") || query.includes("algorithms")) {
    let bookQuery = "";
    if (query.includes("clean code")) bookQuery = "Clean Code";
    else if (query.includes("c programming")) bookQuery = "C Programming";
    else if (query.includes("algorithms")) bookQuery = "Algorithms";
    else {
      const match = query.match(/(?:search for|find|about)\s+([a-zA-Z0-9\s]+)/);
      if (match) bookQuery = match[1];
    }

    if (bookQuery) {
      toolsToInvoke.push({ serverKey: "library", toolName: "searchBooks", args: { query: bookQuery }, reason: `Library MCP selected to search for book: "${bookQuery}"` });
    } else {
      toolsToInvoke.push({ serverKey: "library", toolName: "getPopularBooks", args: { limit: 3 }, reason: "Library MCP selected because query mentions books or reading" });
    }
  }

  return {
    originalQuery: message.content,
    toolsToInvoke,
  };
}
