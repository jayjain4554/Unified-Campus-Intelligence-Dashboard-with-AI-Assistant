import { NextResponse } from "next/server";
import { callMCPTool } from "@campus-intelligence/ai-assistant";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = Number(searchParams.get("limit") || "5");

    const data = await callMCPTool("events", "get_upcoming_events", { limit });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Events API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch events" }, { status: 500 });
  }
}
