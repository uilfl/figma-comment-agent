"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var globals_1 = require("@jest/globals");
// Set up global test environment
global.jest = globals_1.jest;
// Clear all mocks before each test
beforeEach(function () {
    globals_1.jest.clearAllMocks();
});
