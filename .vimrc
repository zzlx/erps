" ==============================================================================
"
" vimrc配置文件
"
" 以指定vimrc配置文件运行vim: `vim -u vimrc`
"
" author: wangxuemin@zzlx.org
" ==============================================================================

set nocompatible  " Use Vim defaults instead of 100% vi compatibility
set backspace=2   " more powerful backspacing
     
" ------------------------------------------------------------------------------
" 文件类型设置 "
"
filetype on               " 文件类型检测
filetype plugin on        " 根据不同类型的文件加载插件
filetype indent on
filetype plugin indent on

" ------------------------------------------------------------------------------
" 字符编码设置 "
"
set fencs=utf-8,ucs-bom,shift-jis,gb18030,gbk,gb2312,cp936
set termencoding=utf-8
set encoding=utf-8
set fileencoding=utf-8

" ------------------------------------------------------------------------------
" GUI配置 "
"
set wildmenu
set guioptions-=T
set guioptions-=m
set shortmess=atI
set title 

" ------------------------------------------------------------------------------
" 编辑模式配置 "
"
set backupcopy=yes
set viewdir=$HOME/.vim/view
"set clipboard=umapamed
set number
set showcmd
set showmode
"set cursorline   " highlight current line
set mouse=a
set selection=exclusive
set selectmode=mouse,key
"set textwidth=80
set wrap
set linebreak
set formatoptions+=mM
"set scrolloff=5
set magic
set backspace=indent,eol,start
set foldenable
set foldlevelstart=99
set foldnestmax=1
set foldmethod=manual
"set spell spelllang=en_us
"
set wildmenu   " vim命令补全

set noswapfile
set nobackup
set undofile
set undodir=$HOME/.vim/undo
set autochdir  " 自动进入文件所在目录
set history=1000
set autoread
set confirm
set modeline

" 默认缩进设置
set sw=2 
set ts=2 
set softtabstop=2
"set autoindent    " 自动缩进 set noautoindent 取消自动缩进
set smartindent   " 智能缩进

" 查找搜索
set showmatch
set matchtime=1
set hlsearch 
set incsearch    " 实时搜索功能
set ignorecase   " 搜索时大小写不敏感

" 状态显示
set ruler
set statusline=%F[:b%n]%m%r%h%w%y\ %=\ %-8.(%l,%c%V%)\ %p%%
set laststatus=2
set nocursorline

" 语法高亮
syntax on
syntax enable

" ------------------------------------------------------------------------------
" 配置netrw
"
let g:netrw_bufsettings = 'noma nomod nu nobl bh ro nocursorline'
let g:netrw_banner = 1
let g:netrw_browse_split = 3
let g:netrw_winsize = 25
let g:netrw_liststyle = 3
let g:netrw_sort_by = 'name'
let g:netrw_sort_direction = 'normal'

autocmd vimenter * if !argc() | :E | endif " 未提供参数时显示目录列表

" ------------------------------------------------------------------------------
" Theme配置项目 "
"
function! SetTheme()

let Now=strftime("%H") " 获取当前时间
if Now > 6 && Now < 23
  set background=light
else
  set background=dark
endif

set background=light

if &background == "light"
  "hi Normal  ctermfg=Black ctermbg=LightYellow
  hi Comment ctermfg=DarkGrey ctermbg=None guifg=DarkGrey font='Monospace 16'
  hi StatusLine ctermfg=LightGray ctermbg=DarkBlue
endif

if &background == "dark"
  "hi Normal ctermfg=LightCyan ctermbg=0
  hi Comment ctermfg=white ctermbg=None font='Monospace 16'
  hi StatusLine ctermfg=white ctermbg=DarkRed
endif

endfunction

" ------------------------------------------------------------------------------
"
" Targets
" 
" 执行关键字查找:
" 1. 如果是链接关键字, 使用浏览器打开链接
" 2. 如果是目录，使用open命令打开
" 3. 如果是字符串，首先查找字符串对应的函数定义,否则使用grep查找关键字
"
function! Targets()
python << EOM
# coding=utf-8

import re
import vim
import webbrowser

re_url = re.compile(r'https?://[a-zA-Z0-9-./"#$%&\':?=_]+')
re_path = re.compile('\.{1,2}/[a-zA-Z0-9._/]+')
line = vim.current.line
match_url = re_url.search(line)
match_path = re_path.search(line)

if match_url:
    url = match_url.group()
    webbrowser.open(url)
    print 'open URL : %s' % url
elif match_path:
    path = match_path.group()
    vim.command('open ' + path)
    print 'open path : %s' % path
else:
    print 'fialed! : open URL'

EOM
endfunction

" ------------------------------------------------------------------------------
" 设置头
"
func! SetHeader()
  if expand("%:e") == 'sh' 
    call setline(1,"#!/bin/sh")
    call setline(2,"#")
    call setline(3,"#********************************************************************")
    call setline(4,"#Date:         ".strftime("%Y-%m-%d"))
    call setline(5,"#FileName：      ".expand("%"))
    call setline(6,"#********************************************************************")
    call setline(7,"")
  endif
endfunc

" ------------------------------------------------------------------------------
" 自动执行
"
" c脚本配置
autocmd BufRead *.c set cindent             "C/C++缩进方式

"autocmd vimenter * if !argc() | NERDTree | endif

" markdown脚本配置
autocmd BufRead,BufNewFile *.md setfiletype markdown

" shell脚本配置项目
autocmd BufNewFile *.sh exec ":call SetHeader()"
autocmd BufRead,BufNewFile *.sh setfiletype shell set noexpandtab sw=2 ts=2 softtabstop=2
autocmd FileType shell noremap <buffer> <F12> :!sh % <CR>

" js脚本配置
"autocmd BufWinLeave *.mjs,*.cjs mkview
"autocmd BufWinEnter *.mjs,*.cjs silent loadview
autocmd BufRead,BufNewFile *.cjs,*.mjs,*.js set expandtab filetype=javascript
autocmd FileType javascript noremap <buffer> <F12> :!NODE_ENV=test node --trace-warnings --experimental-json-modules %<CR>

" python脚本配置
autocmd Filetype python set fileformat=unix
autocmd Filetype python set foldmethod=indent
autocmd Filetype python set foldlevel=99
autocmd FileType python noremap <buffer> <F12> :!python % <CR>

" html配置
autocmd BufRead *.html,<&faf;HTML>  runtime! syntax/html.vim

" 对所有文件
autocmd BufEnter * exec ":call SetTheme()"

" 自动生效配置文件
autocmd BufWritePost $MYVIMRC source $MYVIMRC

" ------------------------------------------------------------------------------
" 键盘快捷键映射
"
nmap LB 0
nmap LE $
nmap <C-S> :w<CR>             " 保存修改
"vmap <C-v> "+gp
vmap <C-c> "+y

map <C-A> ggVGY
map! <C-A> <Esc>ggVGY
"nmap <c-v> "+gp
"nmap <c-c> "+y
"nmap <silent> <leader>fe :Sexplore!<CR> 
"
map <Tab> :tabnext<CR>  " gt
map <S-Tab> :tabpre<CR> " gT
map <F5> :call Targets()<CR> " 打开目标 
map <F12> :!./%<CR>          " 执行脚本 

nnoremap <C-J> <C-W><C-J>
nnoremap <C-K> <C-W><C-K>
nnoremap <C-L> <C-W><C-L>
nnoremap <C-H> <C-W><C-H>
