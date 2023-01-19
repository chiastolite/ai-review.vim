if exists('g:loaded_ai_review')
  finish
endif

command! -range=% -nargs=1 -complete=customlist,ai_review#options AiReview call ai_review#request("review", [<f-args>, <line1>, <line2>])

let g:loaded_ai_review = 1
