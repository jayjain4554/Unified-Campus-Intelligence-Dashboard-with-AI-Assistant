export interface ServerMetrics {
  serverKey: string;
  requestCount: number;
  errorCount: number;
  totalLatencyMs: number;
}

export interface SystemMetrics {
  servers: Record<string, ServerMetrics>;
  toolUsage: Record<string, number>;
}

// In-memory registry, pre-seeded with some realistic dashboard data
const registry: SystemMetrics = {
  servers: {
    library: { serverKey: "library", requestCount: 142, errorCount: 1, totalLatencyMs: 142 * 45 },
    cafeteria: { serverKey: "cafeteria", requestCount: 385, errorCount: 0, totalLatencyMs: 385 * 22 },
    events: { serverKey: "events", requestCount: 215, errorCount: 4, totalLatencyMs: 215 * 68 },
    academics: { serverKey: "academics", requestCount: 520, errorCount: 2, totalLatencyMs: 520 * 110 }
  },
  toolUsage: {
    "getPopularBooks": 85,
    "searchBooks": 57,
    "get_menu": 385,
    "get_upcoming_events": 215,
    "get_gpa": 310,
    "get_schedule": 190,
    "query_handbook": 20
  }
};

export function recordInvocation(serverKey: string, toolName: string, durationMs: number, error: boolean) {
  // Initialize server if missing
  if (!registry.servers[serverKey]) {
    registry.servers[serverKey] = { serverKey, requestCount: 0, errorCount: 0, totalLatencyMs: 0 };
  }
  
  // Update server metrics
  registry.servers[serverKey].requestCount++;
  registry.servers[serverKey].totalLatencyMs += durationMs;
  if (error) {
    registry.servers[serverKey].errorCount++;
  }

  // Update tool usage
  if (!registry.toolUsage[toolName]) {
    registry.toolUsage[toolName] = 0;
  }
  registry.toolUsage[toolName]++;
}

export function getMetrics(): SystemMetrics {
  return registry;
}
