import { CommandHandler } from "../../extension/commandHandler";
import { CommentProcessor } from "../../services/commentProcessor";
import { ExportService } from "../../services/exportService";
import { ConfigurationManager } from "../../extension/configurationManager";
import { FigmaAgentLogger } from "../../extension/logger";
import { ExportFormat } from "../../types/export";
import { FigmaAgentError } from "../../types/error";

// Mock VSCode
const mockShowInputBox = jest.fn();
const mockShowSaveDialog = jest.fn();
const mockShowInformationMessage = jest.fn();

jest.mock("vscode", () => ({
  window: {
    showInputBox: (...args: any[]) => mockShowInputBox(...args),
    showSaveDialog: (...args: any[]) => mockShowSaveDialog(...args),
    showInformationMessage: (...args: any[]) => mockShowInformationMessage(...args),
    createOutputChannel: jest.fn(() => ({
      appendLine: jest.fn(),
      show: jest.fn(),
    })),
  },
  Uri: {
    file: (path: string) => ({ fsPath: path }),
  },
}));

// Mock FigmaClient
jest.mock("../../api/figmaClient", () => ({
  FigmaClient: jest.fn().mockImplementation(() => ({
    getFileComments: jest.fn().mockResolvedValue([
      {
        id: "1",
        message: "Test comment",
        user: { name: "User", handle: "user" },
        created_at: "2023-01-01T00:00:00Z",
      },
    ]),
  })),
}));

// Mock PromptGenerator
jest.mock("../../services/promptGenerator", () => ({
  PromptGenerator: jest.fn().mockImplementation(() => ({
    generatePrompts: jest.fn().mockResolvedValue([
      {
        id: "prompt-1",
        originalCommentId: "1",
        title: "Test Task",
        description: "Test Description",
        steps: ["Step 1"],
        priority: "medium",
        status: "generated",
      },
    ]),
  })),
}));

describe("CommandHandler", () => {
  let commandHandler: CommandHandler;
  let mockCommentProcessor: jest.Mocked<CommentProcessor>;
  let mockExportService: jest.Mocked<ExportService>;
  let mockConfig: jest.Mocked<ConfigurationManager>;
  let mockLogger: jest.Mocked<FigmaAgentLogger>;

  beforeEach(() => {
    jest.clearAllMocks();

    // Create mocks
    mockCommentProcessor = {
      processComments: jest.fn().mockReturnValue([
        {
          id: "1",
          author: "User",
          message: "Test comment",
          timestamp: new Date(),
          isResolved: false,
        },
      ]),
    } as any;

    mockExportService = {
      exportPrompts: jest.fn().mockResolvedValue({
        success: true,
        filePath: "/test/output.json",
      }),
    } as any;

    mockConfig = {
      getApiToken: jest.fn().mockReturnValue("figd_test-token-12345678901234567890"),
      getOpenAIApiKey: jest.fn().mockReturnValue("test-openai-key"),
      getOpenAIModel: jest.fn().mockReturnValue("gpt-4"),
      getExportFormat: jest.fn().mockReturnValue(ExportFormat.JSON),
    } as any;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      show: jest.fn(),
    } as any;

    commandHandler = new CommandHandler(
      mockCommentProcessor,
      mockExportService,
      mockConfig,
      mockLogger
    );

    // Default mock implementations
    mockShowInputBox.mockResolvedValue("test-file-id");
    mockShowSaveDialog.mockResolvedValue({ fsPath: "/test/output.json" });
  });

  describe("fetchComments", () => {
    it("should fetch and process comments successfully", async () => {
      await commandHandler.fetchComments();

      expect(mockShowInputBox).toHaveBeenCalled();
      expect(mockConfig.getApiToken).toHaveBeenCalled();
      expect(mockCommentProcessor.processComments).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Fetching comments")
      );
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining("Fetched")
      );
    });

    it("should throw error when file ID is not provided", async () => {
      mockShowInputBox.mockResolvedValue(undefined);

      await expect(commandHandler.fetchComments()).rejects.toThrow("File ID is required");
    });

    it("should throw error when file ID is empty", async () => {
      mockShowInputBox.mockResolvedValue("");

      await expect(commandHandler.fetchComments()).rejects.toThrow("File ID is required");
    });

    it("should process comments with excludeResolved option", async () => {
      await commandHandler.fetchComments();

      expect(mockCommentProcessor.processComments).toHaveBeenCalledWith(
        expect.any(Array),
        { excludeResolved: true }
      );
    });

    it("should log success message with comment count", async () => {
      await commandHandler.fetchComments();

      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Successfully fetched 1 comments")
      );
    });
  });

  describe("generatePrompts", () => {
    beforeEach(async () => {
      // Fetch comments first to have data
      await commandHandler.fetchComments();
    });

    it("should generate prompts successfully", async () => {
      await commandHandler.generatePrompts();

      expect(mockConfig.getOpenAIApiKey).toHaveBeenCalled();
      expect(mockConfig.getOpenAIModel).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith(
        expect.stringContaining("Generating prompts")
      );
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining("Generated")
      );
    });

    it("should throw error when no comments are available", async () => {
      const emptyHandler = new CommandHandler(
        mockCommentProcessor,
        mockExportService,
        mockConfig,
        mockLogger
      );

      await expect(emptyHandler.generatePrompts()).rejects.toThrow(
        "No comments available"
      );
    });

    it("should use configured model", async () => {
      mockConfig.getOpenAIModel.mockReturnValue("gpt-3.5-turbo");

      await commandHandler.generatePrompts();

      expect(mockConfig.getOpenAIModel).toHaveBeenCalled();
    });

    it("should log prompt generation", async () => {
      await commandHandler.generatePrompts();

      expect(mockLogger.info).toHaveBeenCalledWith("Generating prompts...");
    });
  });

  describe("exportPrompts", () => {
    beforeEach(async () => {
      // Setup: fetch comments and generate prompts
      await commandHandler.fetchComments();
      await commandHandler.generatePrompts();
    });

    it("should export prompts successfully", async () => {
      await commandHandler.exportPrompts();

      expect(mockShowSaveDialog).toHaveBeenCalled();
      expect(mockConfig.getExportFormat).toHaveBeenCalled();
      expect(mockExportService.exportPrompts).toHaveBeenCalled();
      expect(mockShowInformationMessage).toHaveBeenCalledWith(
        expect.stringContaining("exported to")
      );
    });

    it("should throw error when no prompts are available", async () => {
      const emptyHandler = new CommandHandler(
        mockCommentProcessor,
        mockExportService,
        mockConfig,
        mockLogger
      );

      await expect(emptyHandler.exportPrompts()).rejects.toThrow(
        "No prompts available"
      );
    });

    it("should not export if save dialog is cancelled", async () => {
      mockShowSaveDialog.mockResolvedValue(undefined);

      await commandHandler.exportPrompts();

      expect(mockExportService.exportPrompts).not.toHaveBeenCalled();
    });

    it("should use correct export format", async () => {
      mockConfig.getExportFormat.mockReturnValue(ExportFormat.CSV);

      await commandHandler.exportPrompts();

      expect(mockExportService.exportPrompts).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          format: ExportFormat.CSV,
        })
      );
    });

    it("should handle export failure", async () => {
      mockExportService.exportPrompts.mockResolvedValue({
        success: false,
        filePath: "/test/output.json",
        error: "Export failed",
      });

      await expect(commandHandler.exportPrompts()).rejects.toThrow();
    });

    it("should pass correct output path to export service", async () => {
      mockShowSaveDialog.mockResolvedValue({ fsPath: "/custom/path.json" });

      await commandHandler.exportPrompts();

      expect(mockExportService.exportPrompts).toHaveBeenCalledWith(
        expect.any(Array),
        expect.objectContaining({
          outputPath: "/custom/path.json",
        })
      );
    });
  });

  describe("error handling", () => {
    it("should handle errors in fetchComments", async () => {
      mockConfig.getApiToken.mockImplementation(() => {
        throw new Error("Config error");
      });

      await expect(commandHandler.fetchComments()).rejects.toThrow();
      expect(mockLogger.info).toHaveBeenCalled();
    });

    it("should handle errors in generatePrompts", async () => {
      await commandHandler.fetchComments();

      mockConfig.getOpenAIApiKey.mockImplementation(() => {
        throw new Error("OpenAI config error");
      });

      await expect(commandHandler.generatePrompts()).rejects.toThrow();
    });

    it("should handle export service errors", async () => {
      await commandHandler.fetchComments();
      await commandHandler.generatePrompts();

      mockExportService.exportPrompts.mockRejectedValue(
        new Error("Export error")
      );

      await expect(commandHandler.exportPrompts()).rejects.toThrow();
    });
  });

  describe("workflow integration", () => {
    it("should maintain state across operations", async () => {
      // Fetch comments
      await commandHandler.fetchComments();
      expect(mockCommentProcessor.processComments).toHaveBeenCalled();

      // Generate prompts
      await commandHandler.generatePrompts();
      expect(mockConfig.getOpenAIApiKey).toHaveBeenCalled();

      // Export prompts
      await commandHandler.exportPrompts();
      expect(mockExportService.exportPrompts).toHaveBeenCalled();
    });

    it("should enforce correct operation order", async () => {
      // Try to generate prompts before fetching comments
      await expect(
        commandHandler.generatePrompts()
      ).rejects.toThrow("No comments available");

      // Try to export before generating prompts
      await expect(
        commandHandler.exportPrompts()
      ).rejects.toThrow("No prompts available");
    });
  });

  describe("configuration usage", () => {
    it("should get API token from configuration", async () => {
      await commandHandler.fetchComments();

      expect(mockConfig.getApiToken).toHaveBeenCalled();
    });

    it("should get OpenAI configuration for prompt generation", async () => {
      await commandHandler.fetchComments();
      await commandHandler.generatePrompts();

      expect(mockConfig.getOpenAIApiKey).toHaveBeenCalled();
      expect(mockConfig.getOpenAIModel).toHaveBeenCalled();
    });

    it("should get export format from configuration", async () => {
      await commandHandler.fetchComments();
      await commandHandler.generatePrompts();
      await commandHandler.exportPrompts();

      expect(mockConfig.getExportFormat).toHaveBeenCalled();
    });
  });
});
