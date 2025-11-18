/**
 * Simple console-based logger for use in services and utilities
 * that don't depend on VSCode.
 *
 * For VSCode extension code, use FigmaAgentLogger from extension/logger instead,
 * which provides better integration with VSCode's output channels and UI.
 */
export class Logger {
  constructor(private context: string) {}

  info(message: string, ...args: any[]) {
    console.log(`[${this.context}] INFO:`, message, ...args);
  }

  warn(message: string, ...args: any[]) {
    console.warn(`[${this.context}] WARN:`, message, ...args);
  }

  error(message: string, ...args: any[]) {
    console.error(`[${this.context}] ERROR:`, message, ...args);
  }
}
