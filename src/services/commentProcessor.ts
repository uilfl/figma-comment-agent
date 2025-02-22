import { FigmaComment, ProcessedComment } from "../types/comment";
import { Logger } from "../utils/logger";

export class CommentProcessor {
  private logger: Logger;

  constructor() {
    this.logger = new Logger("CommentProcessor");
  }

  processComments(
    rawComments: any[],
    options: {
      excludeResolved?: boolean;
      filterKeywords?: string[];
    } = {}
  ): ProcessedComment[] {
    try {
      let comments = this.validateAndParseComments(rawComments);

      if (options.excludeResolved) {
        comments = comments.filter((comment) => !comment.isResolved);
      }

      if (options.filterKeywords?.length) {
        comments = comments.filter((comment) =>
          options.filterKeywords!.some((keyword) =>
            comment.message.toLowerCase().includes(keyword.toLowerCase())
          )
        );
      }

      if (comments.length === 0) {
        this.logger.warn("No comments match the filtering criteria");
      }

      return comments;
    } catch (error) {
      this.logger.error("Error processing comments:", error);
      throw new Error("Failed to process comments");
    }
  }

  private validateAndParseComments(rawComments: any[]): ProcessedComment[] {
    return rawComments.map((comment) => {
      if (!this.isValidComment(comment)) {
        this.logger.warn(
          `Invalid comment structure: ${JSON.stringify(comment)}`
        );
        throw new Error("Invalid comment structure");
      }

      return this.parseComment(comment);
    });
  }

  private isValidComment(comment: any): comment is FigmaComment {
    return (
      comment &&
      typeof comment.id === "string" &&
      comment.user &&
      typeof comment.message === "string" &&
      typeof comment.created_at === "string"
    );
  }

  private parseComment(comment: FigmaComment): ProcessedComment {
    return {
      id: comment.id,
      author: comment.user.name || comment.user.handle,
      message: comment.message,
      timestamp: new Date(comment.created_at),
      isResolved: !!comment.resolved_at,
      location: comment.client_meta
        ? {
            x: comment.client_meta.x,
            y: comment.client_meta.y,
            nodeId: comment.client_meta.node_id,
          }
        : undefined,
    };
  }
}
