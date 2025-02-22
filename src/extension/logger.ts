import * as vscode from "vscode";

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
    vscode.window.showErrorMessage(`${message} ${args.join(" ")}`);
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
