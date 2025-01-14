function! ai_review#notify(funcname, args) abort
  if denops#plugin#wait('ai-review') != 0
    return ''
  endif
  return denops#notify('ai-review', a:funcname, a:args)
endfunction

function! ai_review#request(funcname, args) abort
  if denops#plugin#wait('ai-review') != 0
    return ''
  endif
  return denops#request('ai-review', a:funcname, a:args)
endfunction

function! ai_review#options(_, __, ___) abort
  return ['find_bugs', 'optimize', 'add_comments', 'add_tests', 'explain', 'improve_text', 'use_prompt']
endfunction
