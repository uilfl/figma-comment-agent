import OpenAI from "openai";
import { ProcessedComment } from "../types/comment";
import { DevelopmentPrompt, PromptGenerationOptions } from "../types/prompt";
import { Logger } from "../utils/logger";

export class PromptGenerator {
  private openai: OpenAI;
  private logger: Logger;

  constructor(apiKey: string) {
    this.openai = new OpenAI({ apiKey });
    this.logger = new Logger("PromptGenerator");
  }

  async generatePrompts(
    comments: ProcessedComment[],
    options: PromptGenerationOptions = {}
  ): Promise<DevelopmentPrompt[]> {
    const prompts: DevelopmentPrompt[] = [];

    for (const comment of comments) {
      try {
        const prompt = await this.generateSinglePrompt(comment, options);
        prompts.push(prompt);
      } catch (error) {
        this.logger.error(
          `Failed to generate prompt for comment ${comment.id}:`,
          error
        );
        prompts.push(this.createFailedPrompt(comment, error));
      }
    }

    return prompts;
  }

  async regeneratePrompt(
    comment: ProcessedComment,
    options: PromptGenerationOptions = {}
  ): Promise<DevelopmentPrompt> {
    try {
      return await this.generateSinglePrompt(comment, options);
    } catch (error) {
      this.logger.error(
        `Failed to regenerate prompt for comment ${comment.id}:`,
        error
      );
      throw error;
    }
  }

  private async generateSinglePrompt(
    comment: ProcessedComment,
    options: PromptGenerationOptions
  ): Promise<DevelopmentPrompt> {
    const { maxRetries = 3, timeoutMs = 10000, model = "gpt-4" } = options;
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        const response = await Promise.race([
          this.callAIService(comment, model),
          this.createTimeout(timeoutMs),
        ]);

        return this.validateAndFormatPrompt(response ?? undefined, comment);
      } catch (error) {
        lastError = error as Error;
        this.logger.warn(`Attempt ${attempt} failed:`, error);
        if (attempt < maxRetries) await this.delay(1000 * attempt);
      }
    }

    throw lastError || new Error("Failed to generate prompt after all retries");
  }

  private async callAIService(comment: ProcessedComment, model: string) {
    const response = await this.openai.chat.completions.create({
      model,
      messages: [
        {
          role: "system",
          content:
            "Transform Figma comments into clear, actionable development tasks.",
        },
        {
          role: "user",
          content: `Convert this Figma comment into a development prompt: "${comment.message}"`,
        },
      ],
      temperature: 0.7,
    });

    return response.choices[0]?.message?.content;
  }

  private validateAndFormatPrompt(
    aiResponse: string | undefined,
    comment: ProcessedComment
  ): DevelopmentPrompt {
    if (!aiResponse) {
      throw new Error("Empty response from AI service");
    }

    const lines = aiResponse.split("\n").filter((line) => line.trim());

    return {
      id: `prompt-${comment.id}`,
      originalCommentId: comment.id,
      title: lines[0] || "Untitled Task",
      description: lines[1] || "No description provided",
      steps: lines.slice(2).map((step) => step.replace(/^\d+\.\s*/, "")),
      priority: this.determinePriority(comment.message),
      status: "generated",
    };
  }

  private createFailedPrompt(
    comment: ProcessedComment,
    error: any
  ): DevelopmentPrompt {
    return {
      id: `prompt-${comment.id}`,
      originalCommentId: comment.id,
      title: "Failed to Generate Prompt",
      description: comment.message,
      steps: [],
      priority: "medium",
      status: "failed",
      errorDetails: error.message,
    };
  }

  private determinePriority(message: string): "high" | "medium" | "low" {
    const urgentKeywords = ["urgent", "asap", "critical", "emergency"];
    const lowKeywords = ["minor", "whenever", "low priority"];

    message = message.toLowerCase();
    if (urgentKeywords.some((keyword) => message.includes(keyword)))
      return "high";
    if (lowKeywords.some((keyword) => message.includes(keyword))) return "low";
    return "medium";
  }

  private createTimeout(ms: number): Promise<never> {
    return new Promise((_, reject) =>
      setTimeout(
        () => reject(new Error(`Operation timed out after ${ms}ms`)),
        ms
      )
    );
  }

  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}
