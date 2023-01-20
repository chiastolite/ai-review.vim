export const OPENAI_MODES = [
  "find_bugs",
  "optimize",
  "add_comments",
  "add_tests",
  "explain",
  "text_review",
  "use_prompt",
] as const;
export const OPENAI_REVIEW_BUFFER = "ai-review://";
export const OPENAI_API_BASE = "https://api.openai.com/v1";
export const OPENAI_MODEL = "text-davinci-003";
export const OPENAI_MAX_TOKENS = 2048;

export const OPENAI_BASE_CONTEXT = `You are butler. Please reply in Markdown format. When outputting code, enclose
it in code fence with a file type as follows:

\`\`\`typescript
console.log("Hello")
\`\`\`

`;

export const OPENAI_SEPARATOR_LINE = `

--------------------------------------------------------------------------------

`;

export const OPENAI_FIND_BUGS_PROMPT = "Find problems with the following code";
export const OPENAI_OPTIMIZE_PROMPT = "Optimize the following code";
export const OPENAI_ADD_COMMENTS_PROMPT = "Add comments for the following code";
export const OPENAI_ADD_TESTS_PROMPT = "Implement tests for the following code";
export const OPENAI_EXPLAIN_PROMPT = "Explain the following code";

export const OPENAI_TEXT_REVIEW_PROMPT =
  "I want you to act as an English translator, spelling corrector and improver. I will speak to you in any language and you will detect the language, translate it and answer in the corrected and improved version of my text, in English. I want you to replace my simplified A0-level words and sentences with more beautiful and elegant, upper level English words and sentences. Keep the meaning same, but make them more scientific and academic. I want you to only reply the correction, the improvements and nothing else, do not write explanations. My sentences are ";
