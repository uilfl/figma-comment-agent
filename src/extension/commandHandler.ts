import * as vscode from "vscode";
import { FigmaClient } from "../api/figmaClient";
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
          this.logger.info(`Fetching comments for file: ${fileId}`);

          // Get Figma API token from configuration
          const apiToken = this.config.getApiToken();

          // Create Figma client and fetch comments
          const figmaClient = new FigmaClient(apiToken);
          const rawComments = await figmaClient.getFileComments(fileId);

          // Process comments
          this.comments = this.commentProcessor.processComments(rawComments, {
            excludeResolved: true,
          });

          this.logger.info(`Successfully fetched ${this.comments.length} comments`);
        },
        3,
        "fetchComments"
      );

      void vscode.window.showInformationMessage(
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
          this.logger.info("Generating prompts...");

          // Get OpenAI configuration
          const openaiApiKey = this.config.getOpenAIApiKey();
          const model = this.config.getOpenAIModel();

          // Create prompt generator and generate prompts
          const promptGenerator = new PromptGenerator(openaiApiKey);
          this.prompts = await promptGenerator.generatePrompts(this.comments, {
            model,
            maxRetries: 3,
            timeoutMs: 30000,
          });

          this.logger.info(`Successfully generated ${this.prompts.length} prompts`);
        },
        3,
        "generatePrompts"
      );

      void vscode.window.showInformationMessage(
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
          void vscode.window.showInformationMessage(
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
