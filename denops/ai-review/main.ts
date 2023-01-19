import { Denops, fn } from "./deps.ts";
import { buffer, helper, unknownutil, variable } from "./deps.ts";
import {
  getOpenAiClient,
  getOpenAiFileType,
  getOpenAiPrompt,
} from "./openai/client.ts";
import { getVimContext, writeBuffer } from "./vim.ts";
import { OpenAiModes } from "./types.ts";
import { writableStreamFromVim } from "./stream/writable-stream-from-vim.ts";
import { OPENAI_SEPARATOR_LINE } from "./constant.ts";

let openAiWinInfo: buffer.OpenResult | undefined = undefined;

export const main = async (denops: Denops): Promise<void> => {
  await helper.execute(
    denops,
    `
    command! -range=% -nargs=1 -complete=customlist,ai_review#options AiReview call denops#notify("${denops.name}", "review", [<f-args>, <line1>, <line2>])
    `
  );

  denops.dispatcher = {
    review: async (mode, firstLine, lastLine): Promise<void> => {
      unknownutil.assertString(mode);
      unknownutil.assertNumber(firstLine);
      unknownutil.assertNumber(lastLine);

      const { code, fileType } = await getVimContext({
        denops,
        firstLine,
        lastLine,
      });

      const promptFileType = getOpenAiFileType(mode as OpenAiModes, fileType);
      const prompt = getOpenAiPrompt(mode as OpenAiModes, code, promptFileType);

      const openAiClient = getOpenAiClient();
      const openAiStream = await openAiClient.completions({
        prompt: prompt.sendPrompt,
      });

      if (openAiWinInfo == null) {
        openAiWinInfo = await buffer.open(denops, `ai-review://`, {
          opener: "split",
        });
      }

      await fn.setbufvar(denops, openAiWinInfo.bufnr, "&filetype", "markdown");
      await fn.setbufvar(denops, openAiWinInfo.bufnr, "&buftype", "nofile");

      await writeBuffer(
        denops,
        prompt.displayPrompt,
        openAiWinInfo.winid,
        openAiWinInfo.bufnr
      );

      await openAiStream.pipeTo(
        writableStreamFromVim(denops, openAiWinInfo.winid, openAiWinInfo.bufnr)
      );

      await writeBuffer(
        denops,
        OPENAI_SEPARATOR_LINE,
        openAiWinInfo.winid,
        openAiWinInfo.bufnr
      );
    },
  };

  return await Promise.resolve();
};
