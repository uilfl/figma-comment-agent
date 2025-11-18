import { PromptGenerator } from "../../services/promptGenerator";
import { ProcessedComment } from "../../types/comment";
import OpenAI from "openai";

jest.mock("openai");

describe("PromptGenerator", () => {
  let generator: PromptGenerator;
  let mockOpenAI: jest.Mocked<OpenAI>;
  let mockCreate: jest.Mock;

  const testComment: ProcessedComment = {
    id: "comment-1",
    author: "Test User",
    message: "Fix the button color to match the design",
    timestamp: new Date("2023-01-01T00:00:00Z"),
    isResolved: false,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Suppress console logs
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();

    // Mock OpenAI
    mockCreate = jest.fn();
    mockOpenAI = {
      chat: {
        completions: {
          create: mockCreate,
        },
      },
    } as any;

    (OpenAI as jest.MockedClass<typeof OpenAI>).mockImplementation(
      () => mockOpenAI
    );

    generator = new PromptGenerator("test-api-key");
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  describe("generatePrompts", () => {
    it("should generate prompts for multiple comments", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content:
                "Update Button Color\nChange the button color to match the design system\n1. Locate the button component\n2. Update the color property\n3. Test the changes",
            },
          },
        ],
      });

      const comments = [testComment];
      const result = await generator.generatePrompts(comments);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "prompt-comment-1",
        originalCommentId: "comment-1",
        title: "Update Button Color",
        description: "Change the button color to match the design system",
        priority: "medium",
        status: "generated",
      });
      expect(result[0].steps).toEqual([
        "Locate the button component",
        "Update the color property",
        "Test the changes",
      ]);
    });

    it("should handle empty AI response gracefully", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: null } }],
      });

      const promise = generator.generatePrompts([testComment]);

      // Advance timers through all retries
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(3000);

      const result = await promise;

      expect(result).toHaveLength(1);
      expect(result[0].status).toBe("failed");
      expect(result[0].title).toBe("Failed to Generate Prompt");
    });

    it("should create failed prompt when generation fails", async () => {
      mockCreate.mockRejectedValue(new Error("API Error"));

      const promise = generator.generatePrompts([testComment]);

      // Advance timers through all retries
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(3000);

      const result = await promise;

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        status: "failed",
        title: "Failed to Generate Prompt",
        description: testComment.message,
        errorDetails: "API Error",
      });
    });

    it("should process multiple comments successfully", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Task Title\nDescription\nStep 1" } }],
      });

      const comments = [
        testComment,
        { ...testComment, id: "comment-2", message: "Update header" },
      ];

      const result = await generator.generatePrompts(comments);

      expect(result).toHaveLength(2);
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("should continue processing after one comment fails", async () => {
      mockCreate
        .mockRejectedValueOnce(new Error("Failed"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: "Success\nDescription\nStep 1" } }],
        });

      const comments = [
        testComment,
        { ...testComment, id: "comment-2" },
      ];

      const promise = generator.generatePrompts(comments);

      // Advance timers for first comment retries (which will fail)
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(3000);

      const result = await promise;

      expect(result).toHaveLength(2);
      expect(result[0].status).toBe("failed");
      expect(result[1].status).toBe("generated");
    });
  });

  describe("regeneratePrompt", () => {
    it("should regenerate a single prompt successfully", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "New Task\nNew description\nNew step 1\nNew step 2",
            },
          },
        ],
      });

      const result = await generator.regeneratePrompt(testComment);

      expect(result).toMatchObject({
        id: "prompt-comment-1",
        title: "New Task",
        description: "New description",
        status: "generated",
      });
    });

    it("should throw error when regeneration fails", async () => {
      mockCreate.mockRejectedValue(new Error("API Error"));

      const promise = generator.regeneratePrompt(testComment);

      // Advance timers through all retries
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(3000);

      await expect(promise).rejects.toThrow();
    });
  });

  describe("priority determination", () => {
    it("should detect high priority from urgent keywords", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDesc" } }],
      });

      const urgentComment = {
        ...testComment,
        message: "URGENT: Fix critical bug",
      };

      const result = await generator.generatePrompts([urgentComment]);

      expect(result[0].priority).toBe("high");
    });

    it("should detect high priority from 'critical' keyword", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDesc" } }],
      });

      const criticalComment = {
        ...testComment,
        message: "Critical issue needs fixing",
      };

      const result = await generator.generatePrompts([criticalComment]);

      expect(result[0].priority).toBe("high");
    });

    it("should detect high priority from 'asap' keyword", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDesc" } }],
      });

      const asapComment = {
        ...testComment,
        message: "Please fix ASAP",
      };

      const result = await generator.generatePrompts([asapComment]);

      expect(result[0].priority).toBe("high");
    });

    it("should detect low priority from low keywords", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDesc" } }],
      });

      const lowComment = {
        ...testComment,
        message: "Minor change whenever you have time",
      };

      const result = await generator.generatePrompts([lowComment]);

      expect(result[0].priority).toBe("low");
    });

    it("should default to medium priority", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDesc" } }],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].priority).toBe("medium");
    });
  });

  describe("retry logic", () => {
    it("should retry on failure", async () => {
      mockCreate
        .mockRejectedValueOnce(new Error("Temporary error"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: "Title\nDescription" } }],
        });

      const promise = generator.generatePrompts([testComment]);

      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(result[0].status).toBe("generated");
      expect(mockCreate).toHaveBeenCalledTimes(2);
    });

    it("should fail after max retries", async () => {
      mockCreate.mockRejectedValue(new Error("Persistent error"));

      const promise = generator.generatePrompts([testComment]);

      // Advance through all retries
      await jest.advanceTimersByTimeAsync(1000);
      await jest.advanceTimersByTimeAsync(2000);
      await jest.advanceTimersByTimeAsync(3000);

      const result = await promise;

      expect(result[0].status).toBe("failed");
      expect(mockCreate).toHaveBeenCalledTimes(3);
    });

    it("should use exponential backoff for retries", async () => {
      mockCreate
        .mockRejectedValueOnce(new Error("Error 1"))
        .mockRejectedValueOnce(new Error("Error 2"))
        .mockResolvedValueOnce({
          choices: [{ message: { content: "Title\nDescription" } }],
        });

      const promise = generator.generatePrompts([testComment]);

      // First retry: 1000ms
      await jest.advanceTimersByTimeAsync(1000);
      // Second retry: 2000ms
      await jest.advanceTimersByTimeAsync(2000);

      await promise;

      expect(mockCreate).toHaveBeenCalledTimes(3);
    });
  });

  describe("timeout handling", () => {
    it("should timeout after specified duration", async () => {
      mockCreate.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  choices: [{ message: { content: "Title\nDescription" } }],
                }),
              15000
            )
          )
      );

      const promise = generator.generatePrompts([testComment], {
        timeoutMs: 5000,
        maxRetries: 1,
      });

      await jest.advanceTimersByTimeAsync(5000);

      const result = await promise;

      expect(result[0].status).toBe("failed");
      expect(result[0].errorDetails).toContain("timed out");
    });
  });

  describe("response formatting", () => {
    it("should handle response with multiple steps", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content:
                "Task Title\nTask Description\n1. Step one\n2. Step two\n3. Step three",
            },
          },
        ],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].steps).toEqual(["Step one", "Step two", "Step three"]);
    });

    it("should handle response with no steps", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDescription" } }],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].steps).toEqual([]);
    });

    it("should handle response with only title", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Only Title" } }],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].title).toBe("Only Title");
      expect(result[0].description).toBe("No description provided");
    });

    it("should strip numbered prefixes from steps", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Title\nDesc\n1. First\n2. Second\n3. Third",
            },
          },
        ],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].steps).toEqual(["First", "Second", "Third"]);
    });

    it("should filter out empty lines", async () => {
      mockCreate.mockResolvedValue({
        choices: [
          {
            message: {
              content: "Title\n\n\nDescription\n\nStep 1\n\n",
            },
          },
        ],
      });

      const result = await generator.generatePrompts([testComment]);

      expect(result[0].steps).toEqual(["Step 1"]);
    });
  });

  describe("model configuration", () => {
    it("should use specified model", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDescription" } }],
      });

      await generator.generatePrompts([testComment], {
        model: "gpt-3.5-turbo",
      });

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-3.5-turbo",
        })
      );
    });

    it("should default to gpt-4 when no model specified", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDescription" } }],
      });

      await generator.generatePrompts([testComment]);

      expect(mockCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          model: "gpt-4",
        })
      );
    });
  });

  describe("OpenAI API call", () => {
    it("should send correct messages to OpenAI", async () => {
      mockCreate.mockResolvedValue({
        choices: [{ message: { content: "Title\nDescription" } }],
      });

      await generator.generatePrompts([testComment]);

      expect(mockCreate).toHaveBeenCalledWith({
        model: "gpt-4",
        messages: [
          {
            role: "system",
            content:
              "Transform Figma comments into clear, actionable development tasks.",
          },
          {
            role: "user",
            content: `Convert this Figma comment into a development prompt: "${testComment.message}"`,
          },
        ],
        temperature: 0.7,
      });
    });
  });
});
