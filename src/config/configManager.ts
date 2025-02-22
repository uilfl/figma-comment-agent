import * as fs from "fs/promises";
import * as fsSync from "fs";
import * as path from "path";
import { encrypt, decrypt } from "../utils/encryption";
import { ExportFormat } from "../types/export";

export class ConfigManager {
  private readonly configPath: string;
  private config: {
    apiToken?: string;
    defaultExportFormat?: ExportFormat;
    exportPath?: string;
  } = {};
  private initializationPromise: Promise<void>;

  constructor() {
    this.configPath = path.join(
      process.env.HOME || "",
      ".figma_agent",
      "config.json"
    );
    this.initializationPromise = this.loadConfig();
  }

  private async loadConfig() {
    try {
      if (fsSync.existsSync(this.configPath)) {
        const data = await fs.readFile(this.configPath, "utf8");
        this.config = JSON.parse(data);
      }
    } catch (error) {
      console.error("Error loading config:", error);
      this.config = {};
    }
  }

  private async ensureConfigDir() {
    const dir = path.dirname(this.configPath);
    if (!fsSync.existsSync(dir)) {
      await fs.mkdir(dir, { recursive: true });
    }
  }

  private async saveConfig() {
    try {
      await this.ensureConfigDir();
      await fs.writeFile(this.configPath, JSON.stringify(this.config, null, 2));
    } catch (error) {
      console.error("Error saving config:", error);
    }
  }

  async setApiToken(token: string) {
    await this.initializationPromise;
    this.config.apiToken = encrypt(token);
    await this.saveConfig();
  }

  async getApiToken(): Promise<string | null> {
    await this.initializationPromise;
    if (!this.config.apiToken) return null;
    return decrypt(this.config.apiToken);
  }

  async setDefaultExportFormat(format: ExportFormat) {
    await this.initializationPromise;
    this.config.defaultExportFormat = format;
    await this.saveConfig();
  }

  async getDefaultExportFormat(): Promise<ExportFormat> {
    await this.initializationPromise;
    return this.config.defaultExportFormat || ExportFormat.JSON;
  }

  async setExportPath(path: string) {
    await this.initializationPromise;
    this.config.exportPath = path;
    await this.saveConfig();
  }

  async getExportPath(): Promise<string> {
    await this.initializationPromise;
    return this.config.exportPath || "./exports";
  }
}
