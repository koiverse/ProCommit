
import fetch from "node-fetch";
import { MsgGenerator, createDiffAwareUserPrompt, postProcessCommitMessage } from "./msg-generator";
import { getConfiguration } from "@utils/configuration";
import {
  englishInstructions,
  russianInstructions,
  japanInstructions,
  koreanInstructions,
  germanInstructions
} from "@utils/langInstruction";

export class CustomMsgGenerator implements MsgGenerator {
  endpoint: string;
  constructor({ endpoint }: { endpoint?: string }) {
    this.endpoint = endpoint || "";
  }
  async generate(diff: string): Promise<string> {
    if (!this.endpoint) throw new Error("Custom endpoint is required.");
    const url = this.endpoint;
    const config = getConfiguration();
    const language = config.general?.language || "English";
    const includeFileExtension = config.general?.includeFileExtension ?? true;
    let instruction: string;
    switch (language) {
      case "Russian":
        instruction = russianInstructions;
        break;
      case "Japanese":
        instruction = japanInstructions;
        break;
      case "Korean":
        instruction = koreanInstructions;
        break;
      case "German":
        instruction = germanInstructions;
        break;
      case "English":
      default:
        instruction = englishInstructions;
        break;
    }
    const { userPrompt, analysis } = createDiffAwareUserPrompt(diff);
    const prompt = `${instruction}\n\n${userPrompt}`;
    const body = { diff: prompt };
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body)
    });
    if (!response.ok) throw new Error(`Custom generator API error: ${response.statusText}`);
    const data: any = await response.json();
    if (typeof data === "string") return postProcessCommitMessage(data, { includeFileExtension, analysis });
    if (data.commitMessage) return postProcessCommitMessage(data.commitMessage, { includeFileExtension, analysis });
    if (data.message) return postProcessCommitMessage(data.message, { includeFileExtension, analysis });
    if (data.output) return postProcessCommitMessage(data.output, { includeFileExtension, analysis });
    throw new Error("No commit message returned by custom endpoint.");
  }
}
