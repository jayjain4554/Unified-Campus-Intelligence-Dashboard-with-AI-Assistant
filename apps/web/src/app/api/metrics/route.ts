import { NextResponse } from 'next/server';
import { getMetrics } from '@campus-intelligence/ai-assistant';

export async function GET() {
  try {
    const metrics = getMetrics();
    return NextResponse.json(metrics);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
