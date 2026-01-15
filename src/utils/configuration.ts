import { z } from "zod";
import * as vscode from "vscode";

import { DeepKey } from "./types";

const configurationSchema = z.object({
  apiKey: z.string().optional(),
  endpoint: z.string().optional(),
  model: z.string().default("gpt-4o-mini").catch("gpt-4o-mini").optional(),
  temperature: z.number().default(0.2).catch(0.2).optional(),
  maxTokens: z.number().default(196).catch(196).optional(),
  general: z.object({
    generator: z
      .enum(["ChatGPT", "Gemini", "Ollama", "LMStudio", "Smithery", "AutoCommit", "Custom"])
      .default("ChatGPT")
      .catch("ChatGPT")
      .optional(),
    messageApproveMethod: z
      .enum(["Quick pick", "Message file"])
      .default("Quick pick")
      .catch("Quick pick")
      .optional(),
    language: z
      .enum(["English", "Japanese", "Russian", "Korean", "German"])
      .default("English")
      .catch("English")
      .optional(),
    useMultipleResults: z.boolean().default(false).catch(false).optional(),
    showEmoji: z.boolean().default(false).catch(false).optional(),
    includeFileExtension: z.boolean().default(true).catch(true).optional(),
  }),
});

export type Configuration = z.infer<typeof configurationSchema>;

export async function setConfigurationValue(
  key: DeepKey<Configuration>,
  value: any
) {
  const configuration = vscode.workspace.getConfiguration("procommit");
  await configuration.update(key, value, vscode.ConfigurationTarget.Global);
}

export function getLanguage(): string {
  const configuration = vscode.workspace.getConfiguration("procommit");
  const parsed = configurationSchema.parse(configuration);
  return parsed.general.language ?? "English";
}

export function getConfiguration() {
  const configuration = vscode.workspace.getConfiguration("procommit");
  return configurationSchema.parse(configuration);
}

export function getShowEmoji(): boolean {
  const configuration = vscode.workspace.getConfiguration("procommit");
  const parsed = configurationSchema.parse(configuration);
  return parsed.general.showEmoji ?? false;
}
