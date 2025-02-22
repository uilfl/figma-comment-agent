import * as fs from "fs/promises";
import * as path from "path";
import { DevelopmentPrompt } from "../types/prompt";
import { ExportFormat, ExportOptions, ExportResult } from "../types/export";
import { Logger } from "../utils/logger";
import { ErrorService } from "../services/errorService";
import { ErrorCategory, ErrorSeverity, FigmaAgentError } from "../types/error";

export class ExportService {
  private logger: Logger;
  private errorService: ErrorService;

  constructor() {
    this.logger = new Logger("ExportService");
    this.errorService = ErrorService.getInstance();
  }

  async exportPrompts(
    prompts: DevelopmentPrompt[],
    options: ExportOptions
  ): Promise<ExportResult> {
    try {
      await this.errorService.retryOperation(async () => {
        this.validateOptions(options);
        const outputPath = this.resolveOutputPath(options);
        const content = this.formatContent(prompts, options.format);
        await this.writeFile(outputPath, content);
        return { success: true, filePath: outputPath };
      });

      return {
        success: true,
        filePath: options.outputPath,
      };
    } catch (error) {
      const processedError =
        error instanceof Error ? error : new Error(String(error));
      this.errorService.handleError(processedError, "exportPrompts");
      return {
        success: false,
        filePath: options.outputPath,
        error: processedError.message,
      };
    }
  }

  private validateOptions(options: ExportOptions): void {
    if (!Object.values(ExportFormat).includes(options.format)) {
      throw new FigmaAgentError({
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: `Invalid format: ${options.format}`,
        suggestedAction:
          "Please select a valid export format (JSON, CSV, or TXT)",
        retryable: false,
      });
    }

    const dir = path.dirname(options.outputPath);
    if (!fs.access(dir).catch(() => false)) {
      throw new Error(`Directory does not exist: ${dir}`);
    }
  }

  private resolveOutputPath(options: ExportOptions): string {
    let outputPath = options.outputPath;
    if (!path.extname(outputPath)) {
      outputPath += `.${options.format}`;
    }
    return outputPath;
  }

  private formatContent(
    prompts: DevelopmentPrompt[],
    format: ExportFormat
  ): string {
    switch (format) {
      case ExportFormat.CSV:
        return this.formatAsCSV(prompts);
      case ExportFormat.JSON:
        return this.formatAsJSON(prompts);
      case ExportFormat.TXT:
        return this.formatAsTXT(prompts);
      default:
        throw new FigmaAgentError({
          category: ErrorCategory.VALIDATION,
          severity: ErrorSeverity.MEDIUM,
          message: `Unsupported format: ${format}`,
          retryable: false,
        });
    }
  }

  private formatAsCSV(prompts: DevelopmentPrompt[]): string {
    const headers = [
      "ID",
      "Title",
      "Description",
      "Priority",
      "Status",
      "Steps",
    ];
    const rows = [
      headers.join(","),
      ...prompts.map((prompt) =>
        [
          prompt.id,
          `"${this.escapeCSV(prompt.title)}"`,
          `"${this.escapeCSV(prompt.description)}"`,
          prompt.priority,
          prompt.status,
          `"${this.escapeCSV(prompt.steps.join("; "))}"`,
        ].join(",")
      ),
    ];
    return rows.join("\n");
  }

  private formatAsJSON(prompts: DevelopmentPrompt[]): string {
    const data = {
      exportDate: new Date().toISOString(),
      totalPrompts: prompts.length,
      prompts,
    };
    return JSON.stringify(data, null, 2);
  }

  private formatAsTXT(prompts: DevelopmentPrompt[]): string {
    return prompts
      .map((prompt) => {
        return [
          `Task ID: ${prompt.id}`,
          `Title: ${prompt.title}`,
          `Priority: ${prompt.priority}`,
          `Status: ${prompt.status}`,
          "Description:",
          prompt.description,
          "Steps:",
          ...prompt.steps.map((step, index) => `${index + 1}. ${step}`),
          "---",
        ].join("\n");
      })
      .join("\n\n");
  }

  private async writeFile(filePath: string, content: string): Promise<void> {
    try {
      await fs.writeFile(filePath, content, "utf8");
    } catch (error) {
      const processedError =
        error instanceof Error ? error : new Error(String(error));
      if ((processedError as NodeJS.ErrnoException).code === "ENOSPC") {
        throw new FigmaAgentError({
          category: ErrorCategory.FILE,
          severity: ErrorSeverity.CRITICAL,
          message: "Disk space is insufficient",
          retryable: false,
          error: processedError,
        });
      } else if ((processedError as NodeJS.ErrnoException).code === "EPERM") {
        throw new FigmaAgentError({
          category: ErrorCategory.FILE,
          severity: ErrorSeverity.CRITICAL,
          message: "Permission denied when writing file",
          retryable: false,
          error: processedError,
        });
      }
      throw processedError;
    }
  }

  private escapeCSV(text: string): string {
    return text.replace(/"/g, '""');
  }
}
