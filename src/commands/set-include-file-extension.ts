import * as vscode from "vscode";
import { setConfigurationValue } from "@utils/configuration";
import { logToOutputChannel } from "@utils/output";

export async function setIncludeFileExtension() {
  logToOutputChannel("Starting setIncludeFileExtension command");
  const pick = await vscode.window.showQuickPick(["Yes", "No"], {
    title: "Include file extension in commit scope?",
  });

  if (!pick) {
    logToOutputChannel("User canceled setIncludeFileExtension command");
    return;
  }

  const value = pick === "Yes";
  logToOutputChannel(`Saving includeFileExtension configuration: ${value}`);
  await setConfigurationValue("general.includeFileExtension", value);

  return value;
}
