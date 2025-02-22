import * as vscode from "vscode";
import {
  ErrorCategory,
  ErrorSeverity,
  ErrorDetails,
  FigmaAgentError,
} from "../types/error";
import { FigmaAgentLogger } from "../extension/logger";

export class ErrorService {
  private static instance: ErrorService;
  private logger: FigmaAgentLogger;
  private errorHistory: FigmaAgentError[] = [];

  private constructor() {
    this.logger = new FigmaAgentLogger();
  }

  static getInstance(): ErrorService {
    if (!ErrorService.instance) {
      ErrorService.instance = new ErrorService();
    }
    return ErrorService.instance;
  }

  handleError(error: unknown, context?: string): void {
    const figmaError = this.normalizeTofigmaError(
      error instanceof Error ? error : new Error(String(error)),
      context
    );
    this.errorHistory.push(figmaError);
    this.logError(figmaError);
    this.notifyUser(figmaError);
  }

  async retryOperation<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    context?: string
  ): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        return await operation();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        this.logger.warn(`Attempt ${attempt}/${maxRetries} failed:`, error);

        if (attempt < maxRetries) {
          await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
        }
      }
    }

    throw this.normalizeTofigmaError(
      lastError || new Error("Unknown error"),
      context
    );
  }

  private normalizeTofigmaError(
    error: Error,
    context?: string
  ): FigmaAgentError {
    if (error instanceof FigmaAgentError) return error;

    const details = this.categorizeError(error, context);
    return new FigmaAgentError(details);
  }

  private categorizeError(error: Error, context?: string): ErrorDetails {
    // Network errors
    if (
      error.message.includes("ENOTFOUND") ||
      error.message.includes("ETIMEDOUT")
    ) {
      return {
        category: ErrorCategory.NETWORK,
        severity: ErrorSeverity.HIGH,
        message: "Network connection failed",
        technicalDetails: error.message,
        suggestedAction: "Please check your internet connection and try again",
        retryable: true,
        error,
      };
    }

    // API errors
    if (error.message.includes("401") || error.message.includes("API token")) {
      return {
        category: ErrorCategory.API,
        severity: ErrorSeverity.CRITICAL,
        message: "Invalid API token",
        technicalDetails: error.message,
        suggestedAction: "Please check your Figma API token in settings",
        retryable: false,
        error,
      };
    }

    // File system errors
    if (error.message.includes("ENOSPC") || error.message.includes("EPERM")) {
      return {
        category: ErrorCategory.FILE,
        severity: ErrorSeverity.HIGH,
        message: "File system error",
        technicalDetails: error.message,
        suggestedAction: "Please check disk space and permissions",
        retryable: true,
        error,
      };
    }

    // Default case
    return {
      category: ErrorCategory.UNKNOWN,
      severity: ErrorSeverity.MEDIUM,
      message: error.message,
      technicalDetails: error.stack,
      suggestedAction: "Please try again or check the error log for details",
      retryable: true,
      error,
    };
  }

  private logError(error: FigmaAgentError): void {
    const { category, severity, message, technicalDetails } = error.details;
    this.logger.error(
      `[${category}][${severity}] ${message}`,
      technicalDetails || ""
    );
  }

  private notifyUser(error: FigmaAgentError): void {
    const { message, suggestedAction, retryable } = error.details;
    const actions: string[] = [];

    if (retryable) {
      actions.push("Retry");
    }
    actions.push("Show Error Log");

    vscode.window
      .showErrorMessage(
        `${message}${suggestedAction ? ` - ${suggestedAction}` : ""}`,
        ...actions
      )
      .then((selection) => {
        if (selection === "Show Error Log") {
          this.logger.show();
        }
      });
  }

  getErrorHistory(): FigmaAgentError[] {
    return [...this.errorHistory];
  }

  clearErrorHistory(): void {
    this.errorHistory = [];
  }
}
