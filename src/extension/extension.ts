import * as vscode from "vscode";
import { CommentProcessor } from "../services/commentProcessor";
import { PromptGenerator } from "../services/promptGenerator";
import { ExportService } from "../services/exportService";
import { FigmaAgentLogger } from "./logger";
import { CommandHandler } from "./commandHandler";
import { SidebarProvider } from "./sidebarProvider";
import { ConfigurationManager } from "./configurationManager";

export function activate(context: vscode.ExtensionContext) {
  const logger = new FigmaAgentLogger();
  const config = new ConfigurationManager(context);

  const commentProcessor = new CommentProcessor();
  const promptGenerator = new PromptGenerator(config.getApiToken());
  const exportService = new ExportService();

  const commandHandler = new CommandHandler(
    commentProcessor,
    promptGenerator,
    exportService,
    config,
    logger
  );

  const sidebarProvider = new SidebarProvider(context.extensionUri);

  context.subscriptions.push(
    vscode.window.registerWebviewViewProvider(
      "figmaAgentSidebar",
      sidebarProvider
    ),

    vscode.commands.registerCommand("figmaAgent.fetchComments", async () => {
      try {
        await commandHandler.fetchComments();
      } catch (error) {
        logger.error("Failed to fetch comments:", error);
        vscode.window.showErrorMessage("Failed to fetch Figma comments");
      }
    }),

    vscode.commands.registerCommand("figmaAgent.generatePrompts", async () => {
      try {
        await commandHandler.generatePrompts();
      } catch (error) {
        logger.error("Failed to generate prompts:", error);
        vscode.window.showErrorMessage("Failed to generate prompts");
      }
    }),

    vscode.commands.registerCommand("figmaAgent.exportFile", async () => {
      try {
        await commandHandler.exportPrompts();
      } catch (error) {
        logger.error("Failed to export prompts:", error);
        vscode.window.showErrorMessage("Failed to export prompts");
      }
    })
  );
}

export function deactivate() {}
