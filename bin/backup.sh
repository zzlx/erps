#!/bin/sh
# ------------------------------------------------------------------------------
#
# ------------------------------------------------------------------------------

declare -r _ORIG_PWD=$(pwd)               # 记录执行当前命令所在目录
declare -r _ORIG_ARGV=$@                  # 记录原始的参数
declare -r _ORIG_CMD="${_ORIG_PWD}${0}"   # 记录原始命令 
declare -r _ORIG_TASK="${_ORIG_CMD} $*"   # 记录原始命令任务
declare -r _ORIG_UMASK=$(umask)           # 记录原始umask值

tar -a -cf $(1)_backup_$(date "+%Y%M%d").tar.gz $1
