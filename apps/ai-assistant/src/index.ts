import { ChatMessage, AssistantResponse } from "@campus-intelligence/types";
export * from "./agent/types.js";
export { getMetrics, SystemMetrics, ServerMetrics } from "./agent/metrics.js";
export { callMCPTool, PORTS } from "./agent/executor.js";
import { decomposeQuery } from "./agent/planner.js";
import { executePlan } from "./agent/executor.js";
import { synthesizeResponse } from "./agent/synthesizer.js";

/**
 * Main entry point for the Agentic AI Assistant.
 * Uses a pipeline architecture: Plan -> Execute -> Synthesize
 */
export async function handleUserQuery(message: ChatMessage): Promise<AssistantResponse> {
  console.log(`[Agent] Received message: "${message.content}"`);
  
  // Phase 1: Planning
  const plan = await decomposeQuery(message);
  console.log(`[Agent] Generated Plan with ${plan.toolsToInvoke.length} tool(s) to invoke.`);
  
  // Phase 2: Parallel Execution
  const context = await executePlan(plan);
  console.log(`[Agent] Executed Plan. Context holds ${context.results.length} result(s).`);
  
  // Phase 3: Synthesis
  const response = await synthesizeResponse(context);
  console.log(`[Agent] Synthesized Response with ${response.suggestedActions?.length || 0} suggested action(s).`);

  return response;
}
