import { expect } from "chai";
import mockFs from "mock-fs";
import { ConfigManager } from "../../config/configManager";
import { ExportFormat } from "../../types/export";

describe("ConfigManager", () => {
  let configManager: ConfigManager;
  const TEST_HOME = "/test-home";

  beforeEach(() => {
    process.env.HOME = TEST_HOME;
    mockFs({
      [TEST_HOME]: {
        ".figma_agent": {
          "config.json": JSON.stringify({
            apiToken: "encrypted-token",
            defaultExportFormat: "json",
          }),
        },
      },
    });
    configManager = new ConfigManager();
  });

  afterEach(() => {
    mockFs.restore();
    delete process.env.HOME;
  });

  it("should return null when no API token is set", () => {
    mockFs({
      [TEST_HOME]: {
        ".figma_agent": {
          "config.json": "{}",
        },
      },
    });
    const newConfigManager = new ConfigManager();
    expect(newConfigManager.getApiToken()).to.be.null;
  });

  it("should save and retrieve API token", () => {
    const token = "test-token";
    configManager.setApiToken(token);
    expect(configManager.getApiToken()).to.equal(token);
  });

  it("should return default export format when none is set", () => {
    expect(configManager.getDefaultExportFormat()).to.equal(ExportFormat.JSON);
  });
});
