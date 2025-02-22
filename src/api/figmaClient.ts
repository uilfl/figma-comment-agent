import axios, { AxiosInstance } from "axios";
import { validateToken } from "../utils/validation";
import { FigmaComment, FigmaApiError } from "../types/figma";

export class FigmaClient {
  private readonly client: AxiosInstance;
  private readonly maxRetries: number = 3;

  constructor(apiToken: string) {
    if (!validateToken(apiToken)) {
      throw new FigmaApiError("Invalid Figma API token format", 401);
    }

    this.client = axios.create({
      baseURL: "https://api.figma.com/v1",
      headers: {
        "X-Figma-Token": apiToken,
      },
    });

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          throw new FigmaApiError(
            error.response.data.error || "API request failed",
            error.response.status
          );
        }
        throw error;
      }
    );
  }

  private async retryRequest<T>(
    request: () => Promise<T>,
    retryCount = 0
  ): Promise<T> {
    try {
      return await request();
    } catch (error: any) {
      if (retryCount >= this.maxRetries) {
        throw this.handleApiError(error);
      }

      if (this.isRetryableError(error)) {
        const delay = Math.pow(2, retryCount) * 1000;
        await new Promise((resolve) => setTimeout(resolve, delay));
        return this.retryRequest(request, retryCount + 1);
      }

      throw this.handleApiError(error);
    }
  }

  private isRetryableError(error: any): boolean {
    return (
      error.response?.status === 429 ||
      error.response?.status === 500 ||
      error.code === "ECONNRESET"
    );
  }

  private handleApiError(error: any): FigmaApiError {
    if (error instanceof FigmaApiError) {
      return error;
    }

    if (error.response) {
      const { status, data } = error.response;
      return new FigmaApiError(
        data.error || this.getErrorMessageForStatus(status),
        status
      );
    }

    if (error.request) {
      // Network error occurred
      return new FigmaApiError("Network request failed", 503);
    }

    return new FigmaApiError(error.message || "Unknown error", 500);
  }

  private getErrorMessageForStatus(status: number): string {
    switch (status) {
      case 401:
        return "Invalid API token";
      case 403:
        return "Access forbidden";
      case 404:
        return "File not found";
      case 429:
        return "Too many requests";
      case 500:
        return "Figma server error";
      default:
        return "Unknown API error";
    }
  }

  async getFileComments(fileId: string): Promise<FigmaComment[]> {
    try {
      const response = await this.retryRequest(async () => {
        return await this.client.get(`/files/${fileId}/comments`);
      });
      return response.data.comments;
    } catch (error) {
      throw this.handleApiError(error);
    }
  }
}
