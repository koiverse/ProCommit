import * as vscode from "vscode";
import { setConfigurationValue } from "@utils/configuration";
import { logToOutputChannel } from "@utils/output";

export async function setMaxTokens() {
  logToOutputChannel("Starting setMaxTokens command");
  const maxTokens = await vscode.window.showInputBox({
    title: "Enter the maximum number of tokens for AI commit messages",
    value: "196",
    validateInput: (value) => {
      const num = parseInt(value, 10);
      return isNaN(num) || num <= 0 ? "Max tokens must be a positive integer" : null;
    },
  });

  if (!maxTokens) {
    logToOutputChannel("User canceled setMaxTokens command");
    return;
  }

  logToOutputChannel("Saving max tokens configuration");
  await setConfigurationValue("maxTokens", parseInt(maxTokens, 10));

  return maxTokens;
}
