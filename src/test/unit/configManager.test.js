"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var chai_1 = require("chai");
var mock_fs_1 = __importDefault(require("mock-fs"));
var configManager_1 = require("../../config/configManager");
var export_1 = require("../../types/export");
describe("ConfigManager", function () {
    var configManager;
    var TEST_HOME = "/test-home";
    beforeEach(function () {
        var _a;
        process.env.HOME = TEST_HOME;
        (0, mock_fs_1.default)((_a = {},
            _a[TEST_HOME] = {
                ".figma_agent": {
                    "config.json": JSON.stringify({
                        apiToken: "encrypted-token",
                        defaultExportFormat: "json",
                    }),
                },
            },
            _a));
        configManager = new configManager_1.ConfigManager();
    });
    afterEach(function () {
        mock_fs_1.default.restore();
        delete process.env.HOME;
    });
    it("should return null when no API token is set", function () {
        var _a;
        (0, mock_fs_1.default)((_a = {},
            _a[TEST_HOME] = {
                ".figma_agent": {
                    "config.json": "{}",
                },
            },
            _a));
        var newConfigManager = new configManager_1.ConfigManager();
        (0, chai_1.expect)(newConfigManager.getApiToken()).to.be.null;
    });
    it("should save and retrieve API token", function () {
        var token = "test-token";
        configManager.setApiToken(token);
        (0, chai_1.expect)(configManager.getApiToken()).to.equal(token);
    });
    it("should return default export format when none is set", function () {
        (0, chai_1.expect)(configManager.getDefaultExportFormat()).to.equal(export_1.ExportFormat.JSON);
    });
});
