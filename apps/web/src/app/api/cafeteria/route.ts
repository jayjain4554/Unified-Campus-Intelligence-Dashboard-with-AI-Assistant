import { NextResponse } from "next/server";
import { callMCPTool } from "@campus-intelligence/ai-assistant";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const mealType = searchParams.get("mealType") || "Lunch";
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0]; // YYYY-MM-DD

    const data = await callMCPTool("cafeteria", "get_menu", { date, mealType });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Cafeteria API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch menu" }, { status: 500 });
  }
}
