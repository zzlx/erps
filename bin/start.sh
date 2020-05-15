#!/usr/bin/env bash
################################################################################
#
# start.sh
#
# 用户安装、部署、管理erps系统.
#
# Author: wangxuemin@zzlx.org
################################################################################

# 定义只读变量
readonly _ORIG_PWD=$(pwd)      # 记录执行当前命令所在目录
readonly _ORIG_CMD="$0 $*"     # 记录原始参数以备再次执行
readonly _ORIG_UMASK=$(umask)  # 记录原始umask值
readonly _ARGV=$@              # 记录原始的参数
readonly _FILE_NAME=${0##*/}
readonly _APP_ROOT=$(dirname $(dirname $0)) # 获取代码库根目录位置

# 定义可配置变量
_APP_NAME=null  # 默认为null

# 可供子shell使用的变量
export _USE_DEBUG=true # 调试模式
export _QUITE=false    # 静默模式
export _UPGRADE_CHECK=true # 默认检查更新
export _IS_ROOT=$(if [ $UID -eq 0 ]; then echo true; else echo false; fi;)

################################################################################

# 帮助文档
_help_message() { 
  cat <<- EOF
	$(_get_package_name) --Options

	Options:
		-b, --build       Build ui apps
		-h, --help        Display help message
		-i, --install     Install ERP services
		-v, --version     Display version
		-t, --test        Test ERP services

		--install         Install
		--commit          Commit a change to remote repo
		--start           Start the ERP service
		--restart         Restart the ERP service
		--stop            Stop the ERP service

	Examples:

	EOF
}

# Main process
_main() { 
  # 检查依赖的函数
	_require host
  _require openssl 

  # 准备系统变量
	_get_os;

  # 解析命令行参数,执行相应程序
  while [[ -n ${1+defined} ]]; do
    case $1 in
      -h | --help )
        _help_message; _exit 0;;
      -v | --version )
        _show_version; _exit 0;;
      -s | --start )
        node --no-warnings --experimental-json-modules $_APP_FILE $@;
        ;;
      --push-commit )
        _commit_and_push;
        _exit 0;;
      --deploy-pki )
        _deploy_pki_cert;;
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

# create a csr using a private key
_create_csr() {
	csr_file=$1
	csr_key=$2

	# check if domain csr exists
	if [[ -s "$csr_file" ]]; then
		_debug "domain csr exists at - $csr_file"

		# check all domains in config are in csr
		if [[ "$IGNORE_DIRECTORY_DOMAIN" == "true" ]]; then
			alldomains= $(echo "$SANS" | sed -e 's/ //g; s/,$//; y/,/\n/' | sort -u)
		else 
			alldomains=$(echo "$DOMAIN,$SANS" | sed -e 's/ //g; s/,$//; y/,/\n/' sort -u)
		fi

		domains_in_csr=$(openssl req -text -noout -in "$csr_file" \
      | sed -n -e 's/^ *Subject: .* CN=\([A-Za-z0-9.-]*\).*$/\1/p; /^ *DNS:.../ { s/ *DNS://g; y/,/\n/; p; }' \
			| sort -u
		)

		for d in $alldomains; do
      if [[ "$(echo "${domains_in_csr}"| grep "^${d}$")" != "${d}" ]]; then
        echo "existing csr at $csr_file does not contain ${d} - re-create-csr"\
             ".... $(echo "${domains_in_csr}"| grep "^${d}$")"
        _RECREATE_CSR=1
			fi
		done

		#check all domains in csr are in config
    if [[ "$alldomains" != "$domains_in_csr" ]]; then
      info "existing csr at $csr_file does not have the same domains as the config - re-create-csr"
      _RECREATE_CSR=1
    fi
	fi

	# if CSR does not exit, or flag set to recreate,then create it
  if [[ ! -s "$csr_file" ]] || [[ "$_RECREATE_CSR" == "1" ]]; then
    echo "creating domain csr - $csr_file"
    # create a temporary config file, for portability.
    tmp_conf=$(mktemp 2>/dev/null || mktemp -t getssl)
    cat "$SSLCONF" > "$tmp_conf"
    printf "[SAN]\n%s" "$SANLIST" >> "$tmp_conf"
    # add OCSP Must-Staple to the domain csr
    # if openssl version >= 1.1.0 one can also use "tlsfeature = status_request"
    if [[ "$OCSP_MUST_STAPLE" == "true" ]]; then
      printf "\n1.3.6.1.5.5.7.1.24 = DER:30:03:02:01:05" >> "$tmp_conf"
    fi
    openssl req -new -sha256 -key "$csr_key" -subj "$CSR_SUBJECT" -reqexts SAN -config "$tmp_conf" > "$csr_file"
    rm -f "$tmp_conf"
  fi
}

# check if the certificate is installed correctly
_check_certificate() {
	if [[ $CHECK_REMOTE == "true" ]]; then
		sleep $CHECK_REMOTE_WAIT
		CERT_REMOTE=$( echo \
			| openssl s_client -servername $DOMAIN -connect "${DOMAIN}:${REMOTE_PORT}" $REMOTE_EXTRA 2>/dev/null \
			| openssl x509 -noout -fingerprint 2>/dev/null
		)
		CERT_LOCAL=$(openssl x509 -noout -fingerprint < $CERT_FILE 2>/dev/null)
		if [[ $CERT_LOCAL == $CERT_REMOTE ]]; then
			echo "${DOMAIN}" - certificate installed OK on server
		else
			_error_exit $DOMAIN - certificate obtained but certificate on server is different from the new certificate.
		fi


	fi
}

# create a private key(if it doesn`t already exist)
_create_private_key() {
	key_type=$1
	key_loc=$2
	key_len=$3

	#check if key exists, if not then create it
	if [[ -s "$key_loc" ]]; then
		_debug "private key exists at $key_log - skipping regeneration"
	else
		umask 077
		echo "creating private key - $key_loc"
		case "$key_type" in
			rsa)
				openssl genrsa "$key_len" > "$key_loc"
				;;
			prime256v1|secp384r1|secp521r1)
				openssl ecparam -genkey -name "$key_len" > "$key_loc"
				;;
			*)
				_exit "unknown private key algorithm type $key_loc"
				;;
		esac
		umask ${_ORIG_UMASK}

		# remove CSR on generation of new domain key
		if [[ -e "${key_loc%.*}.csr" ]]; then
			rm -f "${key_loc%.*}.csr"
		fi
	fi
}

# deploy pki private key and certificate
_deploy_pki_cert() {
	if [[ ${_IS_ROOT} == 'false' ]]; then
		echo "需要系统管理权限, 请使用\"sudo $_ORIG_CMD\"执行此任务"
		sudo $_ORIG_CMD
	fi

	# 创建private key
	_create_private_key rsa $(hostname) 2048

}

# convert date into epoch time
_date_epoc() {
  if [[ "$os" == "bsd" || "$os" == "mac" ]]; then
    date -j -f "%b %d %T %Y %Z" "$1" +%s
  else
    date -d "$1" +%s
  fi
}

# format date from epoc time to YYYY-MM-DD
_date_fmt() {
  if [[ "$os" == "bsd" || "$os" == "mac" ]]; then
    date -j -f "%s" "$1" +%F
  else
    date -d "@$1" +%F
	fi
}

# calculate the renewal time in epoch
_date_renew() {
	date_now_s=$( date +%s )
	echo "$((date_now_s + RENEW_ALLOW*24*60*60))"
}

# Print help message
_install() {
  echo '部署服务端程序';
}

# 是否是zsh
_is_zsh() {
  [ -n "${ZSH_VERSION-}" ]
}

# check if required function is available
_require() {
  local res;
  for cmd in $@; do
    if [[ $cmd == "_require" ]]; then continue; fi

    res=$(command -v $cmd 2>/dev/null)
    #res=$(type "${1-}" >/dev/null 2>&1)

    if [[ -n $res ]]; then
      continue;
    else
      echo "脚本程序运行前请安装$cmd";
    fi
  done

  unset res;
}

# Sends a request to the ACME server, signed with private key.
_send_signed_request() {
  url=$1
  payload=$s2
  needbase64=$3
  outfile=$4 # save response into this file(certificate data)

  _debug url "$url"

  CURL_HEADER="${TEMP_DIR}/curl.header"
  dp="${TEMP_DIR}/curl.dump"

  CURL="curl "

  if [[ "$CURL -V | head -1 | cut -d' ' -f2" > "7.33" ]]; then
    CURL="$CURL --http1.1"
  fi
  
  CURL="$CURL --user-agent $CURL_USERAGENT --silent --dump-header $CURL_HEADER "

  if [[ ${_USE_EDBUG} -eq 1 ]]; then
    CURL="$CURL --trace-ascii $dp"
  fi

  # convert payload to url base64
  payload64="$(printf "%s" "${payload}" | _urlbase64)"
  
  #get nonce from ACME server


}

# urlbase64 encoded string with '+' replaced with '-'
# '/' replaced with '_'
_urlbase64() {
  openssl base64 -e | tr -d '\n\r' | os_esed -e 's:=*$::g' 'y:+/:-_:' 
}

# base64url decode
_urlbase64_decode() {
  INPUT=$1 # $(if [ -z "$1" ]; then echo -n $(cat -); else echo -n "$1"; fi)
  MOD=$(($(echo -n "$INPUT" | wc -c) % 4))
  PADDING=$(if [ $MOD -eq 2 ]; then echo -n '=='; elif [ $MOD -eq 3 ]; then echo -n '=' ; fi)
  echo -n "$INPUT$PADDING" |
    sed s/-/+/g |
    sed s/_/\\//g |
    openssl base64 -d -A
}

# 获取服务端口
_get_server_port() {
  case "$SERVER_TYPE" in
    "https")
      _SERVICE_PORT=443
      ;;
  esac
}

_is_alias() {
  # this is intentionally not "command alias" so it works in zsh.
  \alias "${1-}" >/dev/null 2>&1
}

# 读取配置文件
_read_configurations() {
  echo 'test'
}

# install required modules
_install() {
  cd $_APP_ROOT; npm install; cd $_ORIG_PWD
}

# 获取package.json中name
_get_package_name() {
	if [[ $_APP_NAME != "null"  ]]; then
		echo $_APP_NAME; return
	fi

  local package=${_APP_ROOT}/package.json
  _APP_NAME=$(cat $package | grep '"name"' | awk -F ":" '{print $2}' | sed 's/[", ]//g')
  echo $_APP_NAME
  unset n package
}

# 获取package.json中version
_get_package_version() {
  local v package=${_APP_ROOT}/package.json
  v=$(cat $package | grep '"version"' | awk -F ":" '{print $2}' | sed 's/[", ]//g')
  echo $v
  unset v package
}

# 确保存在git仓库目录
_get_git_commit_hash() { 
  _check_git_ready;
  git_head="$(cat ${_APP_ROOT}/.git/HEAD)"
  commit_hash="$(cat "${_APP_ROOT}/.git/${git_head:5}")";
  echo $commit_hash;
}

_get_git_branch_name() { 
  _check_git_ready;
  git_head="$(cat ${_APP_ROOT}/.git/HEAD)"
  echo ${git_head##*/};
}

# get the current operation system name
_get_os() {
  uname_res=$(uname -s)
	if [[ ${uname_res} == "Linux" ]]; then
    os="linux"
  elif [[ ${uname_res} == "FreeBSD" ]]; then
    os="bsd"
  elif [[ ${uname_res} == "Darwin" ]]; then
    os="mac"
  else
    os="unknown"
  fi
	
	_debug "detected os type = $os"

  if [[ -f /etc/issue ]]; then
    _debug "Running $(cat /etc/issue)"
  fi

}

# get curl response
_get_cr() {
	url=$1
	_debug url "$url"
	response=$(curl --user-agent $CURL_USERAGENT --silent $url)
	ret=$?
	_debug response $response
	code=$(json_get $response status)
	_debug code $code
	_debug "get_cr return code $ret"
	return $ret
}

_get_curl_version() {
  curl -V | command awk '{ if ($1 == "curl") print $2 }' | command sed 's/-.*$//g'
}

# 显示version版本
_show_version() {
  cat <<- EOF
Version: $(_get_package_version)
Hash: $(_get_git_commit_hash)
Branch: $(_get_git_branch_name)
EOF
}

_build_ui() {
  echo 'build';
}

# 获取utc时间
_utc_date() { 
  date -u "+%Y-%m-%d %H:%M:%S"
}

_check_git_ready() {
  if [[ ! -d $_APP_ROOT/.git ]]; then 
    git -C $_APP_ROOT init
  fi
  return 0;
}

# 提交一次变更
_commit_and_push() {

  if [[ `git diff HEAD` ]]; then
    git -C $_APP_ROOT add -A
    git -C $_APP_ROOT commit -m "$(date "+%Y%m%d")_自动化提交"
  fi

  read -r -p "是否需要上传远程仓库? [Y/n] " input

  case "$input" in
    [yY][eE][sS]|[yY] )
      echo "提交至远程仓库"; 
      git -C $_APP_ROOT push 
      ;;
    * )
      ;;
  esac

  echo "$(_utc_date) 自动化提交完成 $MESSAGE"

}

_os_esed() {
  if [[ "$os" == "bsd" ]]; then # BSD requires -E flag for extended regex
    sed -E "${@}"
  elif [[ "$os" == "mac" ]]; then # MAC uses older BSD style sed.
    sed -E "${@}"
  else
    sed -r "${@}"
  fi
}

_get_json_value() {
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

_error_and_exit() {
  echo -e "${_APP_NAME}: ${1:-"Unknown Error"}" >&2
  exit 1
}

_info() { # Write infomation if QUIET is set 0
  if [[ $_QUIET -eq 0 ]]; then
    echo "$@"
  fi
}

_debug() {
  if [[ $_USE_DEBUG == "true" ]]; then
    echo "DEBUG: $@"
  fi
}

_find_dns_utils() {
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

_get_curl_response() {
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

# copy file to the location
_copy_file_to_location() {
  local name=$1
  local from=$2
  local to=$3
  local suffix=$4



}

# 安装cert
_install_cert() {
  echo "准备安装cert"
}

# 提供脚本退出时需要执行的任务
_exit() {
  # 恢复当前目录,并退出脚本程序
  cd $_ORIG_PWD; 
  exit $@;
}

# give error message on error exit
_error_exit() {
	echo -e "${_get_package_name}: ${1:-"Unknow Error"}" >&2
	exit 1
}

_graceful_exit() {
	exit 0
}

_hex2bin() {
  echo -e -n "$(cat | os_esed -e 's/[[:space:]]//g' -e 's/^(.(.{2})*)$/0\1/' -e 's/(.{2})/\\x\1/g')"
}

# 重启服务
_restart_service() {
  echo "重启服务"
}

# 停止服务
_stop_service() {
  echo "停止服务"

}

# 获取进程id号
_get_process_id() {
  process=$1
  pid=$(ps -ef | grep $process | grep '/bin/java' | grep -v grep | awk '{print $2}')
  echo $pid
}

# 传递所有命令行参数给主程序，执行主程序
_main $@ 
