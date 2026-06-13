import { NextResponse } from "next/server";
import { callMCPTool } from "@campus-intelligence/ai-assistant";

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get("studentId") || "std-123";

    const data = await callMCPTool("academics", "get_gpa", { studentId });
    return NextResponse.json(data);
  } catch (error: any) {
    console.error("Academics GPA API Error:", error);
    return NextResponse.json({ error: error.message || "Failed to fetch GPA details" }, { status: 500 });
  }
}
