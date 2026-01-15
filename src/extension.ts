import * as vscode from "vscode";

import { generateAiCommitCommand, setOpenaiApiKey, setGenerator, setLanguage, setMessageApproveMethod, setModelVersion, setCustomEndpoint, setTemperature, setMaxTokens, setIncludeFileExtension } from "@commands";

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.generateAICommit",
      generateAiCommitCommand
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setOpenAIApiKey",
      setOpenaiApiKey
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setGenerator",
      setGenerator
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setLanguage",
      setLanguage
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setMessageApproveMethod",
      setMessageApproveMethod
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setModelVersion",
      setModelVersion
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setCustomEndpoint",
      setCustomEndpoint
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setTemperature",
      setTemperature
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setMaxTokens",
      setMaxTokens
    )
  );
  context.subscriptions.push(
    vscode.commands.registerCommand(
      "procommit.setIncludeFileExtension",
      setIncludeFileExtension
    )
  );
}

export function deactivate() {}
