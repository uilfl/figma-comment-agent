import * as vscode from "vscode";
import { ExportFormat } from "../types/export";

export class ConfigurationManager {
  constructor(private context: vscode.ExtensionContext) {}

  getApiToken(): string {
    const token = vscode.workspace
      .getConfiguration("figmaAgent")
      .get<string>("apiToken");

    if (!token) {
      throw new Error("Figma API token not configured");
    }
    return token;
  }

  async setApiToken(token: string) {
    if (!token.trim()) {
      throw new Error("API token cannot be empty");
    }

    await vscode.workspace
      .getConfiguration("figmaAgent")
      .update("apiToken", token, true);
  }

  getExportFormat(): ExportFormat {
    return vscode.workspace
      .getConfiguration("figmaAgent")
      .get<ExportFormat>("exportFormat", ExportFormat.JSON);
  }

  async setExportFormat(format: ExportFormat) {
    await vscode.workspace
      .getConfiguration("figmaAgent")
      .update("exportFormat", format, true);
  }

  getWorkspaceState<T>(key: string): T | undefined {
    return this.context.workspaceState.get<T>(key);
  }

  async setWorkspaceState<T>(key: string, value: T): Promise<void> {
    await this.context.workspaceState.update(key, value);
  }
}
