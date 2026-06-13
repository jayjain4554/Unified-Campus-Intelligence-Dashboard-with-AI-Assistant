import { NextResponse } from "next/server";
import { callMCPTool } from "@campus-intelligence/ai-assistant";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query") || "";

    const data = await callMCPTool("library", "searchBooks", { query });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Library Search API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to search books" }, { status: 500 });
  }
}
