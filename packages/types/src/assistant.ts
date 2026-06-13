export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  suggestedActions?: {
    label: string;
    actionType: string;
    payload: Record<string, unknown>;
  }[];
  traces?: ExecutionTrace[];
}

export interface AssistantQuery {
  studentId: string;
  query: string;
  chatHistory?: ChatMessage[];
}

export interface ExecutionTrace {
  toolName: string;
  serverKey: string;
  reason: string;
  durationMs: number;
  recordsReturned: number;
}

export interface AssistantResponse {
  answer: string;
  suggestedActions?: {
    label: string;
    actionType: string;
    payload: Record<string, unknown>;
  }[];
  traces?: ExecutionTrace[];
}
