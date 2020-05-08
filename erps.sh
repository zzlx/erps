#!/usr/bin/env bash
################################################################################
#
# ERPs启动脚本程序
#
# 简单、易用、高效的shell脚本为ERPs提供自动化的服务安装、部署、使用等用途.
#
# author: wangxuemin@zzlx.org
################################################################################

################################################################################
# 定义脚本环境变量 
# 传递参数列表并执行 $@ 表示所有参数, $n 表示第n个参数
# 脚本级别全局变量命名规则:下划线"_"开头
################################################################################

# 定义只读环境变量
# readonly等同于declear -r
readonly _ORIG_ARGV=$@         # 记录原始的参数
readonly _ORIG_CMD="$0 $*"     # 记录原始参数以备再次执行
readonly _ORIG_UMASK=$(umask)  # 记录原始umask值
readonly _ORIG_PWD=$(pwd)      # 记录执行当前命令所在目录
readonly _DAYS=(一 二 三 四 五 六 日)

_APP_NAME=${0##*/}
_APP_ROOT=$(cd $(dirname $0) || exit; pwd -P) # 获取代码库根目录位置
_PACKAGE=${_APP_ROOT}/package.json
_LOG_FILE=${_ORIG_PWD}/${_APP_NAME}_output_log.$$ # 日志文件
_APP_FILE=${_APP_ROOT}/src/server/index.mjs
_UPGRADE_CHECK=1

# 定义子shell可以使用的变量
# export等同于declear -x
export _DEBUG=1 # 调试模式
export _QUITE=0 # 静默模式

################################################################################
# 定义脚本函数
#
# 约定:函数命名均以下划线"_"开头
################################################################################

_is_zsh() {
  [ -n "${ZSH_VERSION-}" ]
}

_has() {
  type "${1-}" >/dev/null 2>&1
}

_is_alias() {
  # this is intentionally not "command alias" so it works in zsh.
  \alias "${1-}" >/dev/null 2>&1
}

# Print help message
_show_help () { 
  _debug "显示命令行帮助信息"
  cat <<- EOF
$_SCRIPT_NAME  --Options

Options:
  -b, --build       Build ui apps
  -h, --help        Display help message
  -i, --install     Install ERP services
  -v, --version     Display version
  -t, --test        Test ERP services

  --start           Start the ERP service
  --restart         Restart the ERP service
  --stop            Stop the ERP service

Examples:
EOF
}

# 读取配置文件
_read_configurations() {
  echo 'test'
}

# Check the function is available
_require() {
  if [[ "$#" -gt 1 ]]; then # if more than one value, check list
    for i in "$@"; do
      echo 'test'
    done
  else # if only one value, check it
    echo 'echo'
  fi
}

# install required modules
_install() {
  cd $_APP_ROOT
  npm install
  cd $_PWD
}

# 显示version版本
_show_version () {
  local v
  v=$(cat $_PACKAGE | grep version | awk -F ":" '{print $2}' | sed 's/[", ]//g')

  cat <<- EOF
Version: $v
Branch: $(_get_git_branch_name)
Hash: $(_get_git_commit_hash)
Node: $(node -v)
EOF
  unset v
}

_curl_version() {
  curl -V | command awk '{ if ($1 == "curl") print $2 }' | command sed 's/-.*$//g'
}

_build_ui () {
  echo 'build';
}

# 获取utc时间
_utc_date () { 
  date -u "+%Y-%m-%d %H:%M:%S"
}

_check_git_ready () {
  if [[ ! -d $_APP_ROOT/.git ]]; then 
    git -C $_APP_ROOT init
  fi
  return 0;
}

# 确保存在git仓库目录
_get_git_commit_hash () { 
  _check_git_ready;
  git_head="$(cat ${_APP_ROOT}/.git/HEAD)"
  commit_hash="$(cat "${_APP_ROOT}/.git/${git_head:5}")";
  echo $commit_hash;
}

_get_git_branch_name () { 
  _check_git_ready;
  git_head="$(cat ${_APP_ROOT}/.git/HEAD)"
  echo ${git_head##*/};
}

# 提交变更
_commit_and_push () {
  git -C $_APP_ROOT add -A .
  git -C $_APP_ROOT commit -m "$(date "+%Y%m%d")_自动化提交"
  echo "$(_utc_date) 自动化提交完成 $MESSAGE"
}

_get_json_value () {
  if [[ -z "$1" ]] || [[ "$1" == "null" ]]; then
    echo "json was blank"
    return
  fi
  echo "$2";
}

_root_user() {
  if test "$(id -u)" -ne 0; then
    echo "${_APP_NAME}: only root can use ${_APP_NAME}" 1>&2
    exit 1
  fi
}

_error_and_exit () {
  echo -e "${_APP_NAME}: ${1:-"Unknown Error"}" >&2
  exit 1
}

_info () { # Write infomation if QUIET is set 0
  if [[ $_QUIET -eq 0 ]]; then
    echo "$@"
  fi
}

_debug () {
  if [[ $_DEBUG -eq 1 ]]; then
    echo "DEBUG:$@"
  fi
}

_find_dns_utils () {
  HAS_NSLOOKUP=false
  HAS_DIG_OR_DRILL=""
  HAS_HOST=false
  if [[ -n "$(command -v nslookup 2>/dev/null)" ]]; then
    _debug "HAS_NSLOOKUP=true"
    HAS_NSLOOKUP=true
  fi

  if [[ -n "$(command -v drill 2>/dev/null)" ]]; then
    _debug "HAS_DIG_OR_DRILL=drill"
    HAS_DIG_OR_DRILL="drill"
  elif [[ -n "$(command -v dig 2>/dev/null)" ]]; then
    _debug "HAS_DIG_OR_DRILL=dig"
    HAS_DIG_OR_DRILL="dig"
  fi

  if [[ -n "$(command -v host 2>/dev/null)" ]]; then
    _debug "HAS HOST=true"
    HAS_HOST=true
  fi
}

_get_curl_response () {
  url="$1"
  _debug url "$url"
  response=$(curl --user-agent "$CURL_USER_AGENT" --silent "$url")
  ret=$?
  _debug response "$response"
  code=$(json_get "$response" status)
  _debug code "$code"
  _debug "get_cr return code $ret"
  return $ret
}


# Detect the current Operating System
_detect_os() { 
  local OS=$(uname -s)  # get the operating system name

  case "$OS" in
    Linux )
      ;;
    Darwin )
      ;;
    * )
      ;;
  esac

  _debug "detected os type = $OS"

  if [[ -f /etc/issue ]]; then
    _debug "Running $(cat /etc/issue)"
  fi

  unset OS
}

# 提供脚本退出时需要执行的任务
_exit () {
  # 恢复当前目录,并退出脚本程序
  cd $_ORIG_PWD; exit $@;
}

# 获取进程id号
_get_process_id () {
  process=$1
  pid=$(ps -ef | grep $process | grep '/bin/java' | grep -v grep | awk '{print $2}')
  echo $pid
}

# 主程序
# 接受命令行参数，执行程序任务
_main () { 
  cd $_APP_ROOT # 进入程序根目录
  #_get_json_value $(cat "$APP_ROOT/package.json" )
  #_find_dns_utils

  # 解析命令行参数,执行相应程序
  while [[ -n ${1+defined} ]]; do
    case $1 in
      -h | --help )
        _show_help; _exit 0 ;;
      -v | --version )
        _show_version; _exit 0 ;;
      -s | --start )
        node --no-warnings --experimental-json-modules $_APP_FILE $@;
        ;;
      --commit )
        _commit_and_push;
        ;;
      -c )
        echo -n "输入一些文本 > ";
        read text
        echo "你的输入：$text";
        ;;
      * )
        echo "输入的参数$1 不被支持.";
        ;;
    esac
    shift
  done
}

_main $@ # 传递所有命令行参数给主程序，执行主程序
