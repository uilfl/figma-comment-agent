import { expect } from "chai";
import * as sinon from "sinon";
import { ErrorService } from "../../services/errorService";
import { ErrorCategory, ErrorSeverity } from "../../types/error";

describe("ErrorService", () => {
  let errorService: ErrorService;
  let clock: sinon.SinonFakeTimers;

  beforeEach(() => {
    errorService = ErrorService.getInstance();
    clock = sinon.useFakeTimers();
  });

  afterEach(() => {
    clock.restore();
  });

  it("should retry operations with exponential backoff", async () => {
    let attempts = 0;
    const operation = async () => {
      attempts++;
      if (attempts < 3) throw new Error("Temporary failure");
      return "success";
    };

    const promise = errorService.retryOperation(operation);

    // Advance the timer for each retry
    await clock.tickAsync(1000); // First retry
    await clock.tickAsync(2000); // Second retry
    await clock.tickAsync(4000); // Third retry

    const result = await promise;
    expect(result).to.equal("success");
    expect(attempts).to.equal(3);
  }, 10000); // Increased timeout

  it("should categorize network errors correctly", () => {
    const error = new Error("ETIMEDOUT");
    errorService.handleError(error);
    const history = errorService.getErrorHistory();

    expect(history[0].details.category).to.equal(ErrorCategory.NETWORK);
    expect(history[0].details.severity).to.equal(ErrorSeverity.HIGH);
  });
});
