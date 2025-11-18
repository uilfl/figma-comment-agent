import { ExportService } from "../../services/exportService";
import { DevelopmentPrompt } from "../../types/prompt";
import { ExportFormat } from "../../types/export";
import * as fs from "fs/promises";

jest.mock("fs/promises");
const mockedFs = fs as jest.Mocked<typeof fs>;

describe("ExportService", () => {
  let exportService: ExportService;

  const testPrompts: DevelopmentPrompt[] = [
    {
      id: "prompt-1",
      originalCommentId: "comment-1",
      title: "Fix Button Color",
      description: "Update the button color to match design system",
      steps: ["Locate button component", "Update color property", "Test changes"],
      priority: "high",
      status: "generated",
    },
    {
      id: "prompt-2",
      originalCommentId: "comment-2",
      title: "Update Header Layout",
      description: "Modify header to use flex layout",
      steps: ["Change display to flex", "Adjust spacing"],
      priority: "medium",
      status: "generated",
    },
  ];

  beforeEach(() => {
    exportService = new ExportService();
    jest.clearAllMocks();

    // Suppress console logs
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    // Mock fs.writeFile to succeed by default
    mockedFs.writeFile.mockResolvedValue(undefined);
    mockedFs.access.mockResolvedValue(undefined);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("exportPrompts - JSON format", () => {
    it("should export prompts as JSON successfully", async () => {
      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(true);
      expect(result.filePath).toBe("/test/output.json");
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it("should format JSON with proper structure", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;
      const parsed = JSON.parse(content);

      expect(parsed).toHaveProperty("exportDate");
      expect(parsed).toHaveProperty("totalPrompts", 2);
      expect(parsed).toHaveProperty("prompts");
      expect(parsed.prompts).toHaveLength(2);
    });

    it("should include all prompt fields in JSON", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;
      const parsed = JSON.parse(content);

      expect(parsed.prompts[0]).toMatchObject({
        id: "prompt-1",
        title: "Fix Button Color",
        description: "Update the button color to match design system",
        priority: "high",
        status: "generated",
      });
    });
  });

  describe("exportPrompts - CSV format", () => {
    it("should export prompts as CSV successfully", async () => {
      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.CSV,
        outputPath: "/test/output.csv",
      });

      expect(result.success).toBe(true);
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it("should format CSV with proper headers", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.CSV,
        outputPath: "/test/output.csv",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;
      const lines = content.split("\n");

      expect(lines[0]).toBe("ID,Title,Description,Priority,Status,Steps");
    });

    it("should escape quotes in CSV content", async () => {
      const promptWithQuotes: DevelopmentPrompt[] = [
        {
          id: "prompt-1",
          originalCommentId: "comment-1",
          title: 'Fix "button" color',
          description: 'Update the "primary" button',
          steps: ['Locate "button"'],
          priority: "high",
          status: "generated",
        },
      ];

      await exportService.exportPrompts(promptWithQuotes, {
        format: ExportFormat.CSV,
        outputPath: "/test/output.csv",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain('""button""');
      expect(content).toContain('""primary""');
    });

    it("should join steps with semicolon in CSV", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.CSV,
        outputPath: "/test/output.csv",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain("Locate button component; Update color property; Test changes");
    });
  });

  describe("exportPrompts - TXT format", () => {
    it("should export prompts as TXT successfully", async () => {
      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.TXT,
        outputPath: "/test/output.txt",
      });

      expect(result.success).toBe(true);
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it("should format TXT with proper structure", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.TXT,
        outputPath: "/test/output.txt",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toContain("Task ID: prompt-1");
      expect(content).toContain("Title: Fix Button Color");
      expect(content).toContain("Priority: high");
      expect(content).toContain("Status: generated");
      expect(content).toContain("Description:");
      expect(content).toContain("Steps:");
      expect(content).toContain("1. Locate button component");
      expect(content).toContain("---");
    });

    it("should separate multiple prompts with blank lines", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.TXT,
        outputPath: "/test/output.txt",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const content = writeCall[1] as string;

      expect(content).toMatch(/---\n\n/);
    });
  });

  describe("file path handling", () => {
    it("should add file extension if missing", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const filePath = writeCall[0];

      expect(filePath).toBe("/test/output.json");
    });

    it("should preserve existing extension", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const filePath = writeCall[0];

      expect(filePath).toBe("/test/output.json");
    });

    it("should add correct extension for CSV", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.CSV,
        outputPath: "/test/output",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const filePath = writeCall[0];

      expect(filePath).toBe("/test/output.csv");
    });

    it("should add correct extension for TXT", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.TXT,
        outputPath: "/test/output",
      });

      const writeCall = mockedFs.writeFile.mock.calls[0];
      const filePath = writeCall[0];

      expect(filePath).toBe("/test/output.txt");
    });
  });

  describe("error handling", () => {
    it("should handle file write errors gracefully", async () => {
      mockedFs.writeFile.mockRejectedValue(new Error("Write failed"));

      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle ENOSPC error (disk full)", async () => {
      const error: any = new Error("No space left");
      error.code = "ENOSPC";
      mockedFs.writeFile.mockRejectedValue(error);

      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(false);
    });

    it("should handle EPERM error (permission denied)", async () => {
      const error: any = new Error("Permission denied");
      error.code = "EPERM";
      mockedFs.writeFile.mockRejectedValue(error);

      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(false);
    });

    it("should return error details in result", async () => {
      mockedFs.writeFile.mockRejectedValue(new Error("Custom error message"));

      const result = await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.error).toContain("Custom error message");
    });
  });

  describe("edge cases", () => {
    it("should handle empty prompts array", async () => {
      const result = await exportService.exportPrompts([], {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(true);
      expect(mockedFs.writeFile).toHaveBeenCalled();
    });

    it("should handle prompts with empty steps", async () => {
      const promptWithoutSteps: DevelopmentPrompt[] = [
        {
          ...testPrompts[0],
          steps: [],
        },
      ];

      const result = await exportService.exportPrompts(promptWithoutSteps, {
        format: ExportFormat.TXT,
        outputPath: "/test/output.txt",
      });

      expect(result.success).toBe(true);
    });

    it("should handle prompts with special characters", async () => {
      const specialPrompt: DevelopmentPrompt[] = [
        {
          id: "prompt-1",
          originalCommentId: "comment-1",
          title: "Fix & Update < > \"quotes\"",
          description: "Contains special chars: &, <, >, \"",
          steps: ["Step with special chars: &, <, >"],
          priority: "high",
          status: "generated",
        },
      ];

      const result = await exportService.exportPrompts(specialPrompt, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(true);
    });

    it("should handle very long content", async () => {
      const longPrompts = Array.from({ length: 1000 }, (_, i) => ({
        ...testPrompts[0],
        id: `prompt-${i}`,
      }));

      const result = await exportService.exportPrompts(longPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("encoding", () => {
    it("should write files with UTF-8 encoding", async () => {
      await exportService.exportPrompts(testPrompts, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(mockedFs.writeFile).toHaveBeenCalledWith(
        expect.any(String),
        expect.any(String),
        "utf8"
      );
    });

    it("should handle Unicode characters", async () => {
      const unicodePrompt: DevelopmentPrompt[] = [
        {
          ...testPrompts[0],
          title: "Fix 日本語 emoji 🎉",
          description: "Contains Unicode: 中文, العربية, 😊",
        },
      ];

      const result = await exportService.exportPrompts(unicodePrompt, {
        format: ExportFormat.JSON,
        outputPath: "/test/output.json",
      });

      expect(result.success).toBe(true);
    });
  });
});
