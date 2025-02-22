import { jest } from "@jest/globals";

// Set up global test environment
global.jest = jest;

// Clear all mocks before each test
beforeEach(() => {
  jest.clearAllMocks();
});
