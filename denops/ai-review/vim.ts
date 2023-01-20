import { OPENAI_REVIEW_BUFFER } from "./constant.ts";
import { buffer, Denops, fn, unknownutil, variable } from "./deps.ts";

let openAiWinInfo: buffer.OpenResult | undefined = undefined;

type VimContext = {
  code: string;
  fileType: string;
};

export const getVimContext = async ({
  denops,
  firstLine,
  lastLine,
}: {
  denops: Denops;
  firstLine: number;
  lastLine: number;
}): Promise<VimContext> => {
  const code = (
    (await denops.call(
      "getline",
      firstLine,
      lastLine as number
    )) as Array<string>
  ).join("\n");
  const fileType = (await variable.options.get(denops, "filetype")) as
    | string
    | null;

  return {
    code,
    fileType: fileType ?? "",
  };
};

export const openOpenAiBuffer = async (
  denops: Denops
): Promise<buffer.OpenResult> => {
  if (openAiWinInfo == null) {
    openAiWinInfo = await buffer.open(denops, OPENAI_REVIEW_BUFFER, {
      opener: "split",
    });
  } else {
    const winId = (await fn.bufwinid(denops, openAiWinInfo.bufnr)) as number;

    if (winId === -1) {
      openAiWinInfo = await buffer.open(denops, OPENAI_REVIEW_BUFFER, {
        opener: "split",
      });
    } else {
      await fn.win_gotoid(denops, winId);
    }
  }

  return openAiWinInfo;
};

export const writeBuffer = async (
  denops: Denops,
  text: string,
  winid: number,
  bufnr: number
): Promise<void> => {
  const remaining = (await fn.getbufline(denops, bufnr, "$")).join("\n");
  const newLines = text.split("\n");
  newLines[0] = remaining + newLines[0];
  await buffer.modifiable(denops, bufnr, async () => {
    await fn.setbufline(denops, bufnr, "$", newLines);
  });
  await fn.win_execute(denops, winid, "normal! G$");
};
