import { delay, Denops, fn, unknownutil } from "./deps.ts";
import {
  getOpenAiClient,
  getOpenAiFileType,
  getOpenAiPrompt,
} from "./openai/client.ts";
import { getVimContext, openOpenAiBuffer, writeBuffer } from "./vim.ts";
import { OpenAiModes } from "./types.ts";
import { writableStreamFromVim } from "./stream/writable-stream-from-vim.ts";
import { OPENAI_SEPARATOR_LINE } from "./constant.ts";

let REVIEW_LOCK = false;

export const main = async (denops: Denops): Promise<void> => {
  denops.dispatcher = {
    review: async (mode, firstLine, lastLine): Promise<void> => {
      unknownutil.assertString(mode);
      unknownutil.assertNumber(firstLine);
      unknownutil.assertNumber(lastLine);

      if (mode === "") {
        mode = "use_prompt";
      }

      const { code, fileType } = await getVimContext({
        denops,
        firstLine,
        lastLine,
      });

      const promptFileType = getOpenAiFileType(mode as OpenAiModes, fileType);
      const prompt = getOpenAiPrompt(mode as OpenAiModes, code, promptFileType);

      while (REVIEW_LOCK) {
        await delay(100);
        console.log("waiting for lock");
      }

      REVIEW_LOCK = true;

      const openAiClient = getOpenAiClient();
      const openAiStream = await openAiClient.completions({
        prompt: prompt.sendPrompt,
      });

      const { winid, bufnr } = await openOpenAiBuffer(denops);

      await fn.setbufvar(denops, bufnr, "&filetype", "markdown");
      await fn.setbufvar(denops, bufnr, "&buftype", "nofile");

      await writeBuffer(denops, prompt.displayPrompt, winid, bufnr);
      await openAiStream.pipeTo(writableStreamFromVim(denops, winid, bufnr));
      await writeBuffer(denops, OPENAI_SEPARATOR_LINE, winid, bufnr);

      REVIEW_LOCK = false;
    },
  };

  return await Promise.resolve();
};
