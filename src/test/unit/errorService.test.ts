import { ErrorService } from "../../services/errorService";
import { ErrorCategory, ErrorSeverity } from "../../types/error";

describe("ErrorService", () => {
  let errorService: ErrorService;

  beforeEach(() => {
    jest.useFakeTimers();
    errorService = ErrorService.getInstance();
    errorService.clearErrorHistory();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it("should retry operations with exponential backoff", async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) {
        throw new Error("Temporary failure");
      }
      return "success";
    };

    const promise = errorService.retryOperation(operation);

    // Advance timers for retries
    await jest.advanceTimersByTimeAsync(1000); // First retry
    await jest.advanceTimersByTimeAsync(2000); // Second retry

    const result = await promise;
    expect(result).toBe("success");
    expect(attempts).toBe(3);
  }, 10000);

  it("should categorize network errors correctly", () => {
    const error = new Error("ETIMEDOUT");
    errorService.handleError(error);
    const history = errorService.getErrorHistory();

    expect(history[0].details.category).toBe(ErrorCategory.NETWORK);
    expect(history[0].details.severity).toBe(ErrorSeverity.HIGH);
  });
});
