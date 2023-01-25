# ai-review.vim

This plugin uses OpenAI's API for code review, etc.

This plugin depends on [denops.vim](https://github.com/vim-denops/denops.vim).

## Demo

https://user-images.githubusercontent.com/5423775/213613071-c806bce6-546f-4aa1-8f77-f329b9daa882.mp4

## Usage

Set `OPENAI_API_KEY` environment variable and execute `:AiReview {mode}` or `:'<,'>AiReview {mode}`

mode: `['find_bugs', 'optimize', 'add_comments', 'add_tests', 'explain', 'improve_text', 'use_prompt', 'suggest_variable_name']`

## Acknowledgements

- [butler.vim](https://github.com/lambdalisue/butler.vim)
