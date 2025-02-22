export enum ErrorCategory {
  API = "API",
  CONFIG = "Configuration",
  FILE = "File System",
  VALIDATION = "Validation",
  NETWORK = "Network",
  UNKNOWN = "Unknown",
}

export enum ErrorSeverity {
  LOW = "low",
  MEDIUM = "medium",
  HIGH = "high",
  CRITICAL = "critical",
}

export interface ErrorDetails {
  category: ErrorCategory;
  severity: ErrorSeverity;
  message: string;
  technicalDetails?: string;
  suggestedAction?: string;
  retryable: boolean;
  error?: Error;
}

export class FigmaAgentError extends Error {
  constructor(public details: ErrorDetails) {
    super(details.message);
    this.name = "FigmaAgentError";
  }
}
