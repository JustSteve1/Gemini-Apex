// components/agents/google/types.ts

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
  metadata?: {
    type?: "direct" | "data" | "error" | "empty";
    sql?: string;
    rowCount?: number;
    error?: string;
  };
}

export interface AgentResponse {
  response: string;
  metadata?: {
    type: string;
    sql?: string;
    rowCount?: number;
    error?: string;
  };
  error?: string;
}
