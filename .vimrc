" ==============================================================================
"
" vimrc配置文件
"
" # Usages:
"
" ## 快捷命令
" * :tabnew 新开一个标签页
" * :set list 列示特殊字符
"
" ## 常用操作快捷键：
"
" * U 撤销
" * ctrl + r 反撤销
" * gf: 当前窗口打开
"
" ## 部署配置文件
"
" 'vim -u .vimrc'
" ln -sf $(pwd)/.vimrc ~/.vimrc
"
" ## 使用帮助
"
" :tabnew  open tabpage after the current one
" :+tabnew open tabpage after the next
" :-tabnew open tabpage before current
" :0tabnew open tabpage before first
" :$tabnew open tabpage after last one
"
" [Vim网站](https://www.vim.org) 
"
" ==============================================================================

" ------------------------------------------------------------------------------
" 常规配置
" ------------------------------------------------------------------------------

set nocompatible  " Use Vim defaults instead of 100% vi compatibility
set backspace=2
set title
set ttyfast
set lazyredraw
set noerrorbells
set novisualbell

" Enable clipboard if possible
if has('clipboard') 
	if has('unnamedplus') " When possible use + register for copy-paste 
		set clipboard=unnamed,unnamedplus 
	else " On mac and Windows, use * register for copy-paste 
		set clipboard=unnamed 
	endif 
endif

" 语法高亮
syntax on
syntax enable

filetype on               " 文件类型检测
filetype plugin on        " 根据不同类型的文件加载插件
filetype indent on
filetype plugin indent on

" vim-javascript
let g:javascript_plugin_jsdoc = 1
let javascript_enable_domhtmlcss = 1
let g:javascript_plugin_ngdoc = 1
let g:javascript_plugin_flow = 1
let g:ft_ignore_pat = '\.\(Z\|gz\|bz2\|zip\|tgz\)$'

" ------------------------------------------------------------------------------
" netrw configurations
" ------------------------------------------------------------------------------
let g:netrw_banner = 1
let g:netrw_liststyle = 0    " 显示列表
let g:netrw_browse_split = 4 " 0 当前窗口 1 水平 2 垂直 3 新标签页 4 前一个窗口
let g:netrw_altv = 1  " 水平分割时显示在左
let g:netrw_winsize = 25 " 显示100%
let g:netrw_bufsettings = 'noma nomod nu nobl nowrap ro nornu'
let g:netrw_menu = 1
autocmd FileType netrw setlocal bufhidden=delete

" 字符编码设置 "
set fencs=utf-8,ucs-bom,shift-jis,gb18030,gbk,gb2312,cp936
set termencoding=utf-8
set encoding=utf-8
set fileencoding=utf-8

" GUI配置 "
set wildmenu
set guioptions-=T
set guioptions-=m
set shortmess=atI
set title 

" 状态栏
set ruler
set statusline=%F[:b%n][%{&ff}]%m%r%h%w%y\ %=\ %-8.(%l,%c%V%)\ %p%%
set laststatus=2
set nocursorline

" 编辑模式配置 "
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
set tags=tags

" 默认缩进设置
set expandtab " expand tab 
set sw=2 
set ts=2 
set softtabstop=2
set noautoindent
"set autoindent    " 自动缩进 set noautoindent 取消自动缩进
"set smartindent   " 智能缩进

" 查找搜索
set showmatch
set matchtime=1
set hlsearch 
set incsearch    " 实时搜索功能
set ignorecase   " 搜索时大小写不敏感

" 标签页配置
set tabpagemax=12
set showtabline=1

" ==============================================================================
" 自定义函数
" ==============================================================================

" Theme配置项目 "
function! SetTheme()

set background=light

let Now=strftime("%H") " 获取当前时间

if Now > 6 && Now < 23
  "set background=light
else
  "set background=dark
endif

if &background == "light"
  "hi Normal  ctermfg=Black ctermbg=LightYellow
  hi Comment ctermfg=DarkGrey ctermbg=None guifg=DarkGrey
  hi StatusLine ctermfg=LightGray ctermbg=DarkBlue
endif

if &background == "dark"
  "hi Normal ctermfg=LightCyan ctermbg=0
  hi Comment ctermfg=white ctermbg=None font='Monospace 16'
  hi StatusLine ctermfg=blue ctermbg=DarkRed
endif

endfunction

" ------------------------------------------------------------------------------
" 设置头
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
"  进入vim时执行的任务
function! EnterVim ()
	if argc() == 0 || isdirectory(argv(0))
		:Vexplore
	endif
endfunction

" ------------------------------------------------------------------------------
" 自动执行
" ------------------------------------------------------------------------------
" c脚本配置
autocmd BufRead *.c set cindent             "C/C++缩进方式
autocmd FileType c noremap <buffer> <F5> :!gcc % <CR>
autocmd FileType cpp noremap <buffer> <F5> :!gcc % <CR>

" markdown脚本配置
autocmd BufRead,BufNewFile *.md setfiletype markdown

" shell脚本配置项目
autocmd BufNewFile *.sh exec ":call SetHeader()"
autocmd BufRead,BufNewFile *.sh setfiletype shell set noexpandtab sw=2 ts=2 softtabstop=2
autocmd FileType shell noremap <buffer> <F5> :!/bin/bash % <CR>

" js脚本配置
"autocmd BufWinLeave *.mjs,*.cjs mkview
"autocmd BufWinEnter *.mjs,*.cjs silent loadview
autocmd BufRead,BufNewFile *.cjs,*.mjs,*.js set filetype=javascript
autocmd BufRead,BufNewFile *.ts,*.tsx set filetype=typescript
"autocmd FileType javascript noremap <buffer> <F5> :!NODE_ENV=test NODE_DEBUG=debug:* node --trace-warnings % <CR>
autocmd FileType javascript noremap <buffer> <F5> :!node --trace-warnings % <CR>

" python脚本配置
autocmd Filetype python set fileformat=unix
autocmd Filetype python set foldmethod=indent
autocmd Filetype python set foldlevel=99
autocmd FileType python noremap <buffer> <F5> :!python3 % <CR>

" html配置
autocmd BufRead *.html,<&faf;HTML>  runtime! syntax/html.vim

" 对所有文件
autocmd BufEnter * exec ":call SetTheme()"

" 自动生效配置文件
autocmd BufWritePost $MYVIMRC source $MYVIMRC

" 进入Vim时执行的任务
autocmd VimEnter * :call EnterVim()

" ------------------------------------------------------------------------------
" 键盘映射
" ------------------------------------------------------------------------------
nmap LB 0
nmap LE $

" 组合功能键
nmap <C-S> :w<CR>             " 保存修改
"vmap <C-v> "+gp
vmap <C-c> "+y

map <C-A> ggVGY
map! <C-A> <Esc>ggVGY
"nmap <c-v> "+gp
"nmap <c-c> "+y
"nmap <silent> <leader>fe :Sexplore!<CR> 
"
"map <Tab> :tabnext<CR>  " gt
"map <S-Tab> :tabpre<CR> " gT

"nnoremap <C-J> <C-W><C-J>
"nnoremap <C-K> <C-W><C-K>
"nnoremap <C-L> <C-W><C-L>
"nnoremap <C-H> <C-W><C-H>

" 快捷键映射
"
"map <F3> :call 
"map <F4> :call append(line('.'), strftime('%c'))<CR>
"
"
" 系统定义的快捷键
" CTRL-T or CTRL-O jump back
map <C-T> +gf
