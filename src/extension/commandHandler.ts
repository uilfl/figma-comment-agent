import * as vscode from "vscode";
import { CommentProcessor } from "../services/commentProcessor";
import { PromptGenerator } from "../services/promptGenerator";
import { ExportService } from "../services/exportService";
import { ConfigurationManager } from "./configurationManager";
import { FigmaAgentLogger } from "./logger";
import { ProcessedComment } from "../types/comment";
import { DevelopmentPrompt } from "../types/prompt";
import { ErrorService } from "../services/errorService";
import { ErrorCategory, ErrorSeverity, FigmaAgentError } from "../types/error";

export class CommandHandler {
  private comments: ProcessedComment[] = [];
  private prompts: DevelopmentPrompt[] = [];
  private errorService: ErrorService;

  constructor(
    private commentProcessor: CommentProcessor,
    private promptGenerator: PromptGenerator,
    private exportService: ExportService,
    private config: ConfigurationManager,
    private logger: FigmaAgentLogger
  ) {
    this.errorService = ErrorService.getInstance();
  }

  async fetchComments() {
    const fileId = await vscode.window.showInputBox({
      prompt: "Enter Figma File ID",
      validateInput: (value) => {
        return value && value.trim() ? null : "File ID is required";
      },
    });

    if (!fileId) {
      throw new FigmaAgentError({
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: "File ID is required",
        suggestedAction: "Please provide a valid Figma file ID",
        retryable: true,
      });
    }

    try {
      await this.errorService.retryOperation(
        async () => {
          // Fetch comments implementation here
          this.logger.info(`Fetching comments for file: ${fileId}`);
          // Store results in this.comments
        },
        3,
        "fetchComments"
      );

      vscode.window.showInformationMessage(
        `Fetched ${this.comments.length} comments`
      );
    } catch (error) {
      this.errorService.handleError(error, "fetchComments");
      throw error;
    }
  }

  async generatePrompts() {
    if (!this.comments.length) {
      throw new FigmaAgentError({
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: "No comments available. Fetch comments first.",
        suggestedAction: "Please fetch comments before generating prompts",
        retryable: false,
      });
    }

    try {
      await this.errorService.retryOperation(
        async () => {
          // Generate prompts implementation here
          this.logger.info("Generating prompts...");
          // Store results in this.prompts
        },
        3,
        "generatePrompts"
      );

      vscode.window.showInformationMessage(
        `Generated ${this.prompts.length} prompts`
      );
    } catch (error) {
      this.errorService.handleError(error, "generatePrompts");
      throw error;
    }
  }

  async exportPrompts() {
    if (!this.prompts.length) {
      throw new FigmaAgentError({
        category: ErrorCategory.VALIDATION,
        severity: ErrorSeverity.MEDIUM,
        message: "No prompts available. Generate prompts first.",
        suggestedAction: "Please generate prompts before exporting",
        retryable: false,
      });
    }

    const format = this.config.getExportFormat();
    const uri = await vscode.window.showSaveDialog({
      filters: {
        "All Files": ["*"],
      },
      defaultUri: vscode.Uri.file(`figma-prompts.${format}`),
    });

    if (uri) {
      try {
        const result = await this.errorService.retryOperation(
          async () => {
            return await this.exportService.exportPrompts(this.prompts, {
              format,
              outputPath: uri.fsPath,
            });
          },
          3,
          "exportPrompts"
        );

        if (result.success) {
          vscode.window.showInformationMessage(
            `Prompts exported to ${result.filePath}`
          );
        } else {
          throw new FigmaAgentError({
            category: ErrorCategory.FILE,
            severity: ErrorSeverity.HIGH,
            message: "Failed to export prompts",
            technicalDetails: result.error,
            retryable: true,
          });
        }
      } catch (error) {
        this.errorService.handleError(error, "exportPrompts");
        throw error;
      }
    }
  }
}
