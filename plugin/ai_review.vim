if exists('g:loaded_ai_review')
  finish
endif

command! -range=% -nargs=? -complete=customlist,ai_review#options AiReview call ai_review#notify("review", [<q-args>, <line1>, <line2>])

let g:loaded_ai_review = 1
