import * as vscode from "vscode";
import { setConfigurationValue } from "@utils/configuration";
import { logToOutputChannel } from "@utils/output";

export async function setTemperature() {
  logToOutputChannel("Starting setTemperature command");
  const temperature = await vscode.window.showInputBox({
    title: "Enter the temperature for AI commit messages",
    value: "0.2",
    validateInput: (value) => {
      const num = parseFloat(value);
      return isNaN(num) || num < 0 || num > 1 ? "Temperature must be a number between 0 and 1" : null;
    },
  });

  if (!temperature) {
    logToOutputChannel("User canceled setTemperature command");
    return;
  }

  logToOutputChannel("Saving temperature configuration");
  await setConfigurationValue("temperature", parseFloat(temperature));

  return temperature;
}
