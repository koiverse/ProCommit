import { MsgGenerator } from "./msg-generator";
import { OpenAIApi, Configuration as OpenAIConfiguration, ChatCompletionRequestMessage, ChatCompletionRequestMessageRoleEnum } from "openai";
import { getConfiguration } from "@utils/configuration";
import { trimNewLines } from "@utils/text";
import {
  englishInstructions,
  russianInstructions,
  japanInstructions,
  koreanInstructions,
  germanInstructions,
  russianAssistantInstruction,
  japanAssistantInstruction,
  koreanAssistantInstruction,
  germanAssistantInstruction,
  englishAssistantInstruction
} from "@utils/langInstruction";

export class ChatgptMsgGenerator implements MsgGenerator {
  async generate(diff: string): Promise<string> {
    const config = getConfiguration();
    const apiKey = config.apiKey || "";
    const customEndpoint = config.endpoint?.trim() || undefined;
    // Model, temperature, maxTokens are not in config schema, so use defaults
    const model = config.model || "gpt-4o-mini";
    const temperature = config.temperature || 0.2;
    const maxTokens = config.maxTokens || 196;
    const n = config.general.useMultipleResults ? 4 : 1;
    const language = config.general.language || "English";

    let instruction: string;
    let assistantMessage: string;
    switch (language) {
      case "Russian":
        instruction = russianInstructions;
        assistantMessage = russianAssistantInstruction;
        break;
      case "Japanese":
        instruction = japanInstructions;
        assistantMessage = japanAssistantInstruction;
        break;
      case "Korean":
        instruction = koreanInstructions;
        assistantMessage = koreanAssistantInstruction;
        break;
      case "German":
        instruction = germanInstructions;
        assistantMessage = germanAssistantInstruction;
        break;
      case "English":
      default:
        instruction = englishInstructions;
        assistantMessage = englishAssistantInstruction; // Assuming English assistant message is same as instruction
        break;
    }

    const messages: ChatCompletionRequestMessage[] = [
      {
        role: ChatCompletionRequestMessageRoleEnum.System,
        content: instruction,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.User,
        content: diff,
      },
      {
        role: ChatCompletionRequestMessageRoleEnum.Assistant,
        content: assistantMessage,
      },
    ];

    const openai = new OpenAIApi(
      new OpenAIConfiguration({ apiKey }),
      customEndpoint
    );
    const { data } = await openai.createChatCompletion({
      model,
      messages,
      n,
      temperature,
      max_tokens: maxTokens,
    });

    if (!data || !data.choices || data.choices.length === 0) {
      throw new Error("No commit messages were generated. Try again.");
    }

    // Robust post-processing: enforce format and lowercase, clean up scope
    const commitMessages = data.choices.map((choice) => {
      let message = choice.message?.content || "";
      message = trimNewLines(message).replace(/^\*\s*/, "");
      const match = message.match(/^(\w+)\(([^)]+)\):\s*(.+)$/);
      if (match) {
        let [_, type, scope, subject] = match;
        type = type.toLowerCase();
        scope = scope.trim().split("/").pop() || scope.trim();
        try {
          const includeExt = config.general?.includeFileExtension ?? true;
          if (!includeExt) {
            const dotIndex = scope.lastIndexOf('.');
            if (dotIndex > 0) {
              scope = scope.substring(0, dotIndex);
            }
          }
        } catch (e) {}
        subject = subject.trim().toLowerCase();
        scope = scope.replace(/^\/*|\/*$/g, "");
        subject = subject.replace(/^`+|`+$/g, "");
        return `${type}(${scope}): ${subject}`;
      } else {
        return message.trim().toLowerCase();
      }
    });
    return commitMessages[0];
  }
}
