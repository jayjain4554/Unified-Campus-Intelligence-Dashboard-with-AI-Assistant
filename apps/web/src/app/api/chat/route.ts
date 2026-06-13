import { NextResponse } from "next/server";
import { handleUserQuery } from "@campus-intelligence/ai-assistant";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { message } = body;

    if (!message || typeof message.content !== "string") {
      return NextResponse.json({ error: "Invalid message payload" }, { status: 400 });
    }

    const response = await handleUserQuery(message);
    return NextResponse.json(response);
  } catch (error: any) {
    console.error("Chat API route error:", error);
    return NextResponse.json({ error: error.message || "Failed to process chat query" }, { status: 500 });
  }
}
