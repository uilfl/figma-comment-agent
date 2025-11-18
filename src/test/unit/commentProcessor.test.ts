import { CommentProcessor } from "../../services/commentProcessor";
import { FigmaComment } from "../../types/comment";

describe("CommentProcessor", () => {
  let processor: CommentProcessor;

  beforeEach(() => {
    processor = new CommentProcessor();
    // Suppress console logs during tests
    jest.spyOn(console, "log").mockImplementation();
    jest.spyOn(console, "warn").mockImplementation();
    jest.spyOn(console, "error").mockImplementation();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  describe("processComments", () => {
    const validComment: FigmaComment = {
      id: "1",
      file_key: "test-file",
      parent_id: "0",
      message: "This is a test comment",
      user: {
        id: "user-1",
        name: "Test User",
        handle: "testuser",
      },
      created_at: "2023-01-01T00:00:00Z",
    };

    const resolvedComment: FigmaComment = {
      id: "2",
      file_key: "test-file",
      parent_id: "0",
      message: "This comment is resolved",
      user: {
        id: "user-2",
        name: "Test User 2",
        handle: "testuser2",
      },
      created_at: "2023-01-02T00:00:00Z",
      resolved_at: "2023-01-03T00:00:00Z",
    };

    const commentWithLocation: FigmaComment = {
      id: "3",
      file_key: "test-file",
      parent_id: "0",
      message: "Comment with location",
      user: {
        id: "user-3",
        name: "Test User 3",
        handle: "testuser3",
      },
      created_at: "2023-01-04T00:00:00Z",
      client_meta: {
        x: 100,
        y: 200,
        node_id: "node-123",
      },
    };

    it("should process valid comments successfully", () => {
      const result = processor.processComments([validComment]);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: "1",
        author: "Test User",
        message: "This is a test comment",
        isResolved: false,
      });
      expect(result[0].timestamp).toBeInstanceOf(Date);
    });

    it("should use handle when name is not available", () => {
      const commentWithoutName: FigmaComment = {
        ...validComment,
        user: {
          handle: "testhandle",
        } as any,
      };

      const result = processor.processComments([commentWithoutName]);

      expect(result[0].author).toBe("testhandle");
    });

    it("should process multiple comments", () => {
      const result = processor.processComments([validComment, resolvedComment]);

      expect(result).toHaveLength(2);
      expect(result[0].id).toBe("1");
      expect(result[1].id).toBe("2");
    });

    it("should exclude resolved comments when option is set", () => {
      const result = processor.processComments([validComment, resolvedComment], {
        excludeResolved: true,
      });

      expect(result).toHaveLength(1);
      expect(result[0].id).toBe("1");
      expect(result[0].isResolved).toBe(false);
    });

    it("should include resolved comments when option is false", () => {
      const result = processor.processComments([validComment, resolvedComment], {
        excludeResolved: false,
      });

      expect(result).toHaveLength(2);
    });

    it("should filter by keywords (case insensitive)", () => {
      const comments = [
        { ...validComment, message: "Fix the button color" },
        { ...validComment, id: "2", message: "Update the header layout" },
        { ...validComment, id: "3", message: "Change footer design" },
      ];

      const result = processor.processComments(comments, {
        filterKeywords: ["button", "header"],
      });

      expect(result).toHaveLength(2);
      expect(result[0].message).toBe("Fix the button color");
      expect(result[1].message).toBe("Update the header layout");
    });

    it("should filter by keywords with case insensitivity", () => {
      const comments = [{ ...validComment, message: "URGENT: Fix Button" }];

      const result = processor.processComments(comments, {
        filterKeywords: ["urgent"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].message).toBe("URGENT: Fix Button");
    });

    it("should handle multiple filtering options together", () => {
      const comments = [
        { ...validComment, message: "Fix the button" },
        { ...resolvedComment, message: "Fix the header" },
        { ...validComment, id: "3", message: "Update footer" },
      ];

      const result = processor.processComments(comments, {
        excludeResolved: true,
        filterKeywords: ["fix"],
      });

      expect(result).toHaveLength(1);
      expect(result[0].message).toBe("Fix the button");
    });

    it("should process comments with location metadata", () => {
      const result = processor.processComments([commentWithLocation]);

      expect(result[0].location).toBeDefined();
      expect(result[0].location).toMatchObject({
        x: 100,
        y: 200,
        nodeId: "node-123",
      });
    });

    it("should handle comments without location metadata", () => {
      const result = processor.processComments([validComment]);

      expect(result[0].location).toBeUndefined();
    });

    it("should warn when no comments match filtering criteria", () => {
      const warnSpy = jest.spyOn(console, "warn");

      processor.processComments([validComment], {
        filterKeywords: ["nonexistent"],
      });

      expect(warnSpy).toHaveBeenCalled();
      const warnCall = warnSpy.mock.calls[0].join(" ");
      expect(warnCall).toContain("No comments match the filtering criteria");
    });

    it("should return empty array when all comments are filtered out", () => {
      const result = processor.processComments([resolvedComment], {
        excludeResolved: true,
      });

      expect(result).toEqual([]);
    });

    it("should throw error for invalid comment structure", () => {
      const invalidComment = {
        id: "1",
        // missing message and user
      };

      expect(() => processor.processComments([invalidComment as any])).toThrow(
        "Failed to process comments"
      );
    });

    it("should throw error when comment is missing id", () => {
      const invalidComment = {
        message: "Test",
        user: { name: "User", handle: "user" },
        created_at: "2023-01-01T00:00:00Z",
      };

      expect(() => processor.processComments([invalidComment as any])).toThrow();
    });

    it("should throw error when comment is missing user", () => {
      const invalidComment = {
        id: "1",
        message: "Test",
        created_at: "2023-01-01T00:00:00Z",
      };

      expect(() => processor.processComments([invalidComment as any])).toThrow();
    });

    it("should throw error when comment is missing message", () => {
      const invalidComment = {
        id: "1",
        user: { name: "User", handle: "user" },
        created_at: "2023-01-01T00:00:00Z",
      };

      expect(() => processor.processComments([invalidComment as any])).toThrow();
    });

    it("should throw error when comment is missing created_at", () => {
      const invalidComment = {
        id: "1",
        message: "Test",
        user: { name: "User", handle: "user" },
      };

      expect(() => processor.processComments([invalidComment as any])).toThrow();
    });

    it("should handle empty comments array", () => {
      const result = processor.processComments([]);

      expect(result).toEqual([]);
    });

    it("should parse timestamps correctly", () => {
      const result = processor.processComments([validComment]);

      expect(result[0].timestamp).toEqual(new Date("2023-01-01T00:00:00Z"));
    });

    it("should correctly identify resolved comments", () => {
      const result = processor.processComments([resolvedComment]);

      expect(result[0].isResolved).toBe(true);
    });

    it("should correctly identify unresolved comments", () => {
      const result = processor.processComments([validComment]);

      expect(result[0].isResolved).toBe(false);
    });

    it("should log error and throw when processing fails", () => {
      const errorSpy = jest.spyOn(console, "error");

      expect(() => processor.processComments([null as any])).toThrow(
        "Failed to process comments"
      );
      expect(errorSpy).toHaveBeenCalled();
    });
  });
});
