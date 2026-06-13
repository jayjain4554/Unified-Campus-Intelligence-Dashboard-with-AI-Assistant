import { AssistantResponse } from "@campus-intelligence/types";
import { ExecutionContext } from "./types.js";

/**
 * Synthesizes the final natural language response and aggregated actions 
 * by combining data from the execution context.
 */
export async function synthesizeResponse(context: ExecutionContext): Promise<AssistantResponse> {
  const parts: string[] = [];
  const suggestedActions: any[] = [];

  if (context.results.length === 0) {
    return {
      answer: `I'm your Unified Campus AI Assistant. You can ask me questions like:\n` +
        `- "What events are tomorrow and what vegan food is available?"\n` +
        `- "What is my GPA?"\n` +
        `- "What is my class schedule?"\n` +
        `- "Is the Clean Code book available?"\n\nHow can I help you today?`,
      suggestedActions: [
        { label: "Explore Dashboard", actionType: "NAVIGATE", payload: { path: "/" } }
      ]
    };
  }

  for (const res of context.results) {
    if (res.error) {
      parts.push(`⚠️ Error fetching data from ${res.tool.serverKey}: ${res.error}`);
      continue;
    }

    if (res.tool.serverKey === "academics") {
      if (res.tool.toolName === "get_gpa") {
        parts.push(`🎓 **Academics**\nYour current GPA is **${res.data.gpa}** with **${res.data.totalCreditsEarned}** credits earned.\nHere are some of your recent grades:\n` + 
          res.data.gradesHistory.map((g: any) => `- **${g.courseName}** (${g.courseId}): **${g.grade}**`).join("\n"));
        suggestedActions.push({ label: "View Academic Portal", actionType: "NAVIGATE", payload: { path: "/academics" } });
      } else {
        parts.push(`📅 **Schedule**\nHere is your current class schedule:\n` +
          res.data.map((c: any) => `- **${c.courseName}** with ${c.instructor} in *${c.room}* (${c.days.join(", ")} at ${c.startTime})`).join("\n"));
        suggestedActions.push({ label: "View Timetable", actionType: "NAVIGATE", payload: { path: "/academics" } });
      }
    }

    else if (res.tool.serverKey === "cafeteria") {
      const mealType = res.tool.args.mealType || "Lunch";
      const isVeganOnly = res.tool.args.isVeganOnly;
      const filtered = isVeganOnly ? res.data.filter((item: any) => item.isVegan) : res.data;

      let text = `🥗 **Cafeteria Menu (${mealType})**\n`;
      if (filtered.length === 0) {
        text += `No ${isVeganOnly ? "vegan " : ""}items found today.`;
      } else {
        text += filtered.map((item: any) => `- **${item.name}** ($${item.price.toFixed(2)}) ${item.isVegan ? "🌱 (Vegan)" : item.isVegetarian ? "🧀 (Vegetarian)" : ""}`).join("\n");
      }
      parts.push(text);
      suggestedActions.push({ label: "See Full Menu", actionType: "NAVIGATE", payload: { path: "/cafeteria" } });
    }

    else if (res.tool.serverKey === "events") {
      parts.push(`🎉 **Upcoming Events**\n` +
        res.data.map((e: any) => `- **${e.title}** (${e.category}): Organized by ${e.organizer} on *${new Date(e.startTime).toLocaleDateString()}* at ${e.location.buildingName} ${e.location.room || ""}. RSVPs: **${e.rsvpCount}**`).join("\n"));
      suggestedActions.push({ label: "Browse Events", actionType: "NAVIGATE", payload: { path: "/events" } });
    }

    else if (res.tool.serverKey === "library") {
      if (res.tool.toolName === "searchBooks") {
        if (res.data.length === 0) {
          parts.push(`📚 **Library**\nI couldn't find any books matching "${res.tool.args.query}".`);
        } else {
          parts.push(`📚 **Library Results for "${res.tool.args.query}"**\n` +
            res.data.map((b: any) => `- **${b.title}** by ${b.author} [Shelf: ${b.locationShelf}] - Status: ${b.copiesAvailable > 0 ? `**Available** (${b.copiesAvailable} copies)` : "**Checked Out**"}`).join("\n"));
        }
      } else {
        parts.push(`📚 **Popular Library Books**\n` +
          res.data.map((b: any) => `- **${b.title}** by ${b.author} (Score: ${b.popularityScore})`).join("\n"));
      }
      suggestedActions.push({ label: "View Library", actionType: "NAVIGATE", payload: { path: "/library" } });
    }
  }

  // Deduplicate actions by path to prevent multiple identical buttons
  const uniqueActionsMap = new Map();
  for (const action of suggestedActions) {
    uniqueActionsMap.set(action.payload.path, action);
  }

  const traces = context.results.map((res) => ({
    toolName: res.tool.toolName,
    serverKey: res.tool.serverKey,
    reason: res.tool.reason,
    durationMs: res.durationMs,
    recordsReturned: res.recordsReturned,
  }));

  return {
    answer: parts.join("\n\n---\n\n"),
    suggestedActions: Array.from(uniqueActionsMap.values()),
    traces
  };
}
