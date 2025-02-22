export interface DevelopmentPrompt {
  id: string;
  originalCommentId: string;
  title: string;
  description: string;
  steps: string[];
  priority: "high" | "medium" | "low";
  status: "pending" | "generated" | "failed";
  errorDetails?: string;
}

export interface PromptGenerationOptions {
  maxRetries?: number;
  timeoutMs?: number;
  model?: string;
}
