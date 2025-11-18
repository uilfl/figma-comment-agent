import * as vscode from "vscode";

/**
 * VSCode-specific logger that integrates with VSCode's output channels.
 * Use this logger for all extension-related code (commands, UI, etc.).
 *
 * For pure TypeScript services that don't depend on VSCode,
 * use the Logger from utils/logger instead.
 */
export class FigmaAgentLogger {
  private outputChannel: vscode.OutputChannel;

  constructor() {
    this.outputChannel = vscode.window.createOutputChannel("Figma Agent");
  }

  info(message: string, ...args: any[]) {
    this.log("INFO", message, ...args);
  }

  warn(message: string, ...args: any[]) {
    this.log("WARN", message, ...args);
  }

  error(message: string, ...args: any[]) {
    this.log("ERROR", message, ...args);
    void vscode.window.showErrorMessage(`${message} ${args.join(" ")}`);
  }

  private log(level: string, message: string, ...args: any[]) {
    const timestamp = new Date().toISOString();
    this.outputChannel.appendLine(
      `[${timestamp}] [${level}] ${message} ${args.join(" ")}`
    );
  }

  show() {
    this.outputChannel.show();
  }
}
