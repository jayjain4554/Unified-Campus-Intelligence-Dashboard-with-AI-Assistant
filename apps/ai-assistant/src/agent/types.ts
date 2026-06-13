export interface ToolInvocation {
  serverKey: "library" | "cafeteria" | "events" | "academics";
  toolName: string;
  args: Record<string, any>;
  reason: string;
}

export interface ExecutionPlan {
  originalQuery: string;
  toolsToInvoke: ToolInvocation[];
}

export interface ExecutionResult {
  tool: ToolInvocation;
  data: any;
  error?: string;
  durationMs: number;
  recordsReturned: number;
}

export interface ExecutionContext {
  results: ExecutionResult[];
}
