import axios from "axios";
import { FigmaClient } from "../../api/figmaClient";
import { FigmaApiError } from "../../types/figma";

jest.mock("axios");
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe("FigmaClient", () => {
  const VALID_TOKEN = "figd_test-token-12345678901234567890";
  const FILE_ID = "test-file-id";
  let mockAxiosInstance: any;

  beforeEach(() => {
    jest.clearAllMocks();
    jest.useFakeTimers();

    // Create a mock axios instance
    mockAxiosInstance = {
      get: jest.fn(),
      interceptors: {
        response: {
          use: jest.fn(),
        },
      },
    };

    mockedAxios.create.mockReturnValue(mockAxiosInstance as any);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  describe("constructor", () => {
    it("should create client with valid token", () => {
      const client = new FigmaClient(VALID_TOKEN);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: "https://api.figma.com/v1",
        headers: {
          "X-Figma-Token": VALID_TOKEN,
        },
      });
      expect(client).toBeInstanceOf(FigmaClient);
    });

    it("should throw FigmaApiError for invalid token format", () => {
      expect(() => new FigmaClient("invalid-token")).toThrow(FigmaApiError);
      expect(() => new FigmaClient("")).toThrow(FigmaApiError);
    });

    it("should set up response interceptor", () => {
      new FigmaClient(VALID_TOKEN);

      expect(mockAxiosInstance.interceptors.response.use).toHaveBeenCalled();
    });
  });

  describe("getFileComments", () => {
    let client: FigmaClient;

    beforeEach(() => {
      client = new FigmaClient(VALID_TOKEN);
    });

    it("should fetch comments successfully", async () => {
      const mockComments = [
        {
          id: "1",
          message: "Test comment 1",
          user: { name: "User 1", handle: "user1" },
          created_at: "2023-01-01T00:00:00Z",
        },
        {
          id: "2",
          message: "Test comment 2",
          user: { name: "User 2", handle: "user2" },
          created_at: "2023-01-02T00:00:00Z",
        },
      ];

      mockAxiosInstance.get.mockResolvedValue({
        data: { comments: mockComments },
      });

      const result = await client.getFileComments(FILE_ID);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith(`/files/${FILE_ID}/comments`);
      expect(result).toEqual(mockComments);
    });

    it("should handle 404 error", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 404,
          data: { error: "File not found" },
        },
      });

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow(FigmaApiError);
      await expect(client.getFileComments(FILE_ID)).rejects.toMatchObject({
        message: "File not found",
        status: 404,
      });
    });

    it("should handle 401 unauthorized error", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 401,
          data: {},
        },
      });

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow();
    });

    it("should handle 403 forbidden error", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: {
          status: 403,
          data: {},
        },
      });

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow();
    });

    it("should retry on 429 rate limit error", async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce({
          response: { status: 429, data: {} },
        })
        .mockResolvedValueOnce({
          data: { comments: [] },
        });

      const promise = client.getFileComments(FILE_ID);

      // Fast-forward through retry delay
      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual([]);
    });

    it("should retry on 500 server error", async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce({
          response: { status: 500, data: {} },
        })
        .mockResolvedValueOnce({
          data: { comments: [] },
        });

      const promise = client.getFileComments(FILE_ID);

      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual([]);
    });

    it("should retry on ECONNRESET network error", async () => {
      mockAxiosInstance.get
        .mockRejectedValueOnce({
          code: "ECONNRESET",
        })
        .mockResolvedValueOnce({
          data: { comments: [] },
        });

      const promise = client.getFileComments(FILE_ID);

      await jest.advanceTimersByTimeAsync(1000);

      const result = await promise;

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(2);
      expect(result).toEqual([]);
    });

    it("should fail after max retries", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { status: 429, data: {} },
      });

      const promise = client.getFileComments(FILE_ID);

      // Fast-forward through all retries
      await jest.advanceTimersByTimeAsync(1000); // First retry
      await jest.advanceTimersByTimeAsync(2000); // Second retry
      await jest.advanceTimersByTimeAsync(4000); // Third retry

      await expect(promise).rejects.toThrow();

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4); // Initial + 3 retries
    });

    it("should handle network request failure", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        request: {},
      });

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow();
    });

    it("should handle unknown error", async () => {
      mockAxiosInstance.get.mockRejectedValue(new Error("Unknown error"));

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow();
    });

    it("should not retry on non-retryable errors", async () => {
      mockAxiosInstance.get.mockRejectedValue({
        response: { status: 404, data: { error: "Not found" } },
      });

      await expect(client.getFileComments(FILE_ID)).rejects.toThrow();

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(1); // No retries
    });
  });

  describe("exponential backoff", () => {
    it("should use exponential backoff for retries", async () => {
      const client = new FigmaClient(VALID_TOKEN);

      mockAxiosInstance.get
        .mockRejectedValueOnce({ response: { status: 429, data: {} } })
        .mockRejectedValueOnce({ response: { status: 429, data: {} } })
        .mockRejectedValueOnce({ response: { status: 429, data: {} } })
        .mockResolvedValueOnce({ data: { comments: [] } });

      const promise = client.getFileComments(FILE_ID);

      // First retry: 1000ms (2^0 * 1000)
      await jest.advanceTimersByTimeAsync(1000);

      // Second retry: 2000ms (2^1 * 1000)
      await jest.advanceTimersByTimeAsync(2000);

      // Third retry: 4000ms (2^2 * 1000)
      await jest.advanceTimersByTimeAsync(4000);

      await promise;

      expect(mockAxiosInstance.get).toHaveBeenCalledTimes(4);
    });
  });
});
