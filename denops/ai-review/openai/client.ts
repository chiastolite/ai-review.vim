import {
  OPENAI_API_BASE,
  OPENAI_BASE_CONTEXT,
  OPENAI_MAX_TOKENS,
  OPENAI_MODEL,
} from "../constant.ts";
import { TextLineStream } from "../deps.ts";
import { OpenAiModes } from "../types.ts";
import {
  OPENAI_ADD_COMMENTS_PROMPT,
  OPENAI_ADD_TESTS_PROMPT,
  OPENAI_EXPLAIN_PROMPT,
  OPENAI_FIND_BUGS_PROMPT,
  OPENAI_OPTIMIZE_PROMPT,
  OPENAI_TEXT_REVIEW_PROMPT,
} from "../constant.ts";

const ORGANIZATION = Deno.env.get("OPENAI_ORGANIZATION") ?? "";
const API_KEY = Deno.env.get("OPENAI_API_KEY");

type Client = {
  completions: typeof completions;
};

type Prompt = {
  sendPrompt: string;
  displayPrompt: string;
};

const request = async (path: string, init: RequestInit): Promise<Response> => {
  init.method = init.method ?? "POST";

  init.headers = new Headers(init.headers);
  init.headers.set("Authorization", `Bearer ${API_KEY}`);
  init.headers.set("Content-Type", "application/json");
  init.headers.set("OpenAI-Organization", ORGANIZATION);

  return await fetch(`${OPENAI_API_BASE}${path}`, init);
};

const completions = async ({ prompt }: { prompt: string }) => {
  const res = request("/completions", {
    body: JSON.stringify({
      model: OPENAI_MODEL,
      prompt,
      max_tokens: OPENAI_MAX_TOKENS,
      stream: true,
      // TODO: temperature
      // temperature: 1,
    }),
  });

  return (await res)
    .body!.pipeThrough(new TextDecoderStream())
    .pipeThrough(new TextLineStream())
    .pipeThrough(new CompletionsStream());
};

export const getOpenAiClient = (): Client => {
  if (API_KEY == null) {
    throw new Error("OPENAI_API_KEY is not set");
  }

  return {
    completions: completions,
  };
};

const displayPromptWithCodeBlock = (
  prompt: string,
  code: string,
  filetype: string
): string => {
  return `${prompt}\n\n\`\`\`${filetype}\n${code}\n\`\`\`\n`;
};

export const getOpenAiPrompt = (
  mode: OpenAiModes,
  code: string,
  fileType: string
): Prompt => {
  switch (mode) {
    case "find_bugs": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_FIND_BUGS_PROMPT}\n\n${code}`,
        displayPrompt: displayPromptWithCodeBlock(
          OPENAI_FIND_BUGS_PROMPT,
          code,
          fileType
        ),
      };
    }
    case "optimize": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_OPTIMIZE_PROMPT}\n\n${code}`,
        displayPrompt: displayPromptWithCodeBlock(
          OPENAI_OPTIMIZE_PROMPT,
          code,
          fileType
        ),
      };
    }
    case "add_comments": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_ADD_COMMENTS_PROMPT}\n\n${code}`,
        displayPrompt: displayPromptWithCodeBlock(
          OPENAI_ADD_COMMENTS_PROMPT,
          code,
          fileType
        ),
      };
    }
    case "add_tests": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_ADD_TESTS_PROMPT}\n\n${code}`,
        displayPrompt: displayPromptWithCodeBlock(
          OPENAI_ADD_TESTS_PROMPT,
          code,
          fileType
        ),
      };
    }
    case "explain": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_EXPLAIN_PROMPT}\n\n${code}`,
        displayPrompt: displayPromptWithCodeBlock(
          OPENAI_EXPLAIN_PROMPT,
          code,
          fileType
        ),
      };
    }
    case "improve_text": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${OPENAI_TEXT_REVIEW_PROMPT}\n\n${code}`,
        displayPrompt: `${OPENAI_TEXT_REVIEW_PROMPT}\n\n${code}`,
      };
    }
    case "use_prompt": {
      return {
        sendPrompt: `${OPENAI_BASE_CONTEXT}${code}`,
        displayPrompt: code,
      };
    }
    default: {
      throw new Error("Invalid mode");
    }
  }
};

// See: https://github.com/lambdalisue/butler.vim/blob/main/denops/butler/openai/completions.ts
class CompletionsStream extends TransformStream<string, string> {
  #prefix = "data: ";
  #index: number;

  constructor(index = 0) {
    super({
      transform: (chunk, controller) => this.#handle(chunk, controller),
    });
    this.#index = index;
  }

  #handle(
    chunk: string,
    controller: TransformStreamDefaultController<string>
  ): void {
    chunk = chunk.trim();
    if (!chunk.length) {
      return;
    }
    if (!chunk.startsWith(this.#prefix)) {
      controller.error(`The chunk is not expected format: ${chunk}`);
      return;
    }
    const data = chunk.substring(this.#prefix.length);
    if (data === "[DONE]") {
      controller.terminate();
      return;
    }
    const result = JSON.parse(data);
    const choice = result.choices[this.#index];
    controller.enqueue(choice.text);
  }
}

export const getOpenAiFileType = (
  mode: OpenAiModes,
  fileType: string
): string => {
  return mode !== "improve_text" && mode !== "use_prompt" ? fileType : "text";
};
