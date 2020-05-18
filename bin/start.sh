#!/usr/bin/env bash
################################################################################
#
# start.sh
#
# Author: wangxuemin@zzlx.org
################################################################################

################################################################################
# shell函数
################################################################################

# 帮助文档
_show_help_message() { 
  cat <<- EOF
	$(_printf $(_get_package_name | _toLowerCase)) [options...]

	Options:
		-b, --build       Build ui apps
		-h, --help        Display this help message
		-i, --install     Install ERP services
		-v, --version     Display version
		-t, --test        Test ERP services

		--install         Install
		--commit          Commit a change to remote repo
		--start           Start the ERP service
		--restart         Restart the ERP service
		--stop            Stop the ERP service

	Usage:

	EOF
}

# 显示version版本
_show_version_message() {
  cat <<- EOF
	Version: $(_get_package_version)
	GitBranch: $(_get_git_branch_name)
	GitHash: $(_get_git_commit_hash)
	EOF
}

# get url of current subscriber agreement
_get_agreement() {
	AGREEMENT=$(curl --silent ${API}/directory | grep '"termsOfService":' | sed 's/^.*"termsOfService": "\([^"]*\)".*$/\1/' | _flatstring)
	echo $AGREEMENT
}

_open_browser() {
  os=$(_get_os)
  case $os in
    mac )
			sleep 3 # 等待3秒后执行下一条命令
      open -a "/Applications/Safari.app" $1;
      ;;
	esac
}

_start_server() {
  _detect_node_modules
  local _SERVER_PATH=${_ROOT}/src/server/index.mjs
  node --no-warnings --experimental-json-modules $_SERVER_PATH;
}

# 获取进程id号
_get_process_id() {
  process=$1
  pid=$(ps -ef | grep $process | grep '/bin/java' | grep -v grep | awk '{print $2}')
  echo $pid
}

# 获取调试开关设置
_get_debug_switcher() {
	if [[ -n $_DEBUG ]]; then echo $_DEBUG; return; fi

  if [[ $_HAS_DOT_ENV == 'true' ]]; then 
    v=$(cat ${_ROOT}/.env | grep 'DEBUG=' | awk -F "=" '{ printf $2 }')
    if [[ $v == 'true' ]]; then _DEBUG='true'; else _DEBUG='false'; fi
  else 
    _DEBUG='false'; 
  fi

	echo $_DEBUG
}

# 获取shell类型
_get_shell_type() {
	if [[ -n $BASH_VERSION ]]; then echo "bash"; return; fi
	if [[ -n $ZSH_VERSION ]]; then echo "zsh"; return; fi
}

# 获取主机名
_get_hostname() {
  if [[ -n $HOST ]]; then echo "$HOST"; return; fi
  if [[ -n $(hostname) ]]; then echo $(hostname); return; fi
}

# create a csr using openssl
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

# 下载服务器证书
_download_certificate() {
	echo '正在下载证书 ...'

	RESPONSE=$(api_request ${CERTIFICATE_URL} "");

	# 相应包含服务器及中间证书,存储导一个链表文件
	echo "${RESPONSE}" | awk '/-----BEGIN CERTIFICATE-----/,0' > "${DOMAIN}/${DOMAIN}.crt"

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

# create a public key
_create_public_key() {
	privateKey=$1
	echo $(openssl rsa -in $privateKey -pubout)
}

# registering account
_registering_account() {
	if [ -n "$CONTACT_EMAIL" ]; then
		REQUEST="{ \"termsOfServiceAgreed\": true, \"contact\": [ \"mailto:${CONTACT_EMAIL}\" ] }"
	else
		REQUEST="{ \"termsOfServiceAgreed\": true }"
	fi

	RESPONSE=$(api_request "${API}/acme/new-acct" "${REQUEST}")
	ACCOUNT_URL=$(echo "${RESPONSE}" | grep -i '^location: ' | sed 's/^location: //i' | _flatstring)

	# api authentication by account URL from now on
	JWS_AUTH="\"kid\": \"${ACCOUNT_URL}\""

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

_create_order() {
	REQUEST="{ \"identifiers\": ["
}

_getting_authorization_tokens() {
	CHALLENGE_URLS=()
	CHALLENGE_TOKENS=()
	KEYAUTHS=()
	for (( i=0; i < ${#DOMAINS[@]}; i++ ))
	do
		log " for ${DOMAINS[$i]}"
		debug "  authorization_url=${AUTHORIZATION_URLS[$i]}"
		RESPONSE="$(api_request "${AUTHORIZATION_URLS[$i]}" "")"
		CHALLENGE_URLS[$i]="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"type": "http-01", "status": "pending", "url": "\([^"]*\)", "token": "\([^"]*\)".*$/\1/')"
		debug "  challenge_url=${CHALLENGE_URLS[$i]}"
		CHALLENGE_TOKENS[$i]="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"type": "http-01", "status": "pending", "url": "\([^"]*\)", "token": "\([^"]*\)".*$/\2/')"
		debug "  challenge_token=${CHALLENGE_TOKENS[$i]}"
		KEYAUTHS[$i]="${CHALLENGE_TOKENS[$i]}.${JWK_THUMBPRINT}"
		debug "  keyauth=${KEYAUTHS[$i]}"
	done

}

# 
_validation_via_http() {
	echo '验证http';
	if [ -n "${WEBROOT}" ];
	then
		log "Copying challenge tokens to DocumentRoot ${WEBROOT} ..."
		(
		cd "${DOMAIN}"
		rm -rf ".well-known"
		mkdir -p ".well-known/acme-challenge"
		for (( i=0; i < ${#DOMAINS[@]}; i++ ))
		do
			echo "${KEYAUTHS[$i]}" > ".well-known/acme-challenge/${CHALLENGE_TOKENS[$i]}"
		done
		rsync -axR ".well-known/" "${WEBROOT}"
		)
		log "Done"
	else
		log "Execute in your DocumentRoot:"
		echo
		echo
		echo "mkdir -p .well-known/acme-challenge"
		for (( i=0; i < ${#DOMAINS[@]}; i++ ))
		do
			echo "echo '${KEYAUTHS[$i]}' > .well-known/acme-challenge/${CHALLENGE_TOKENS[$i]}"
		done
		echo
		echo
		log "Press [Enter] when done."
		read -r
	fi
}

_responsd_to_challenges() {
	for (( i=0; i < ${#DOMAINS[@]}; i++ ))
	do
		debug "${CHALLENGE_URLS[$i]}"
		RESPONSE="$(api_request "${CHALLENGE_URLS[$i]}" "{}")"
	done
}

_detect_node_modules() {
  if [[ ! -d ${_ROOT}/node_modules ]]; then
    cd $_ROOT; npm install; cd $_PWD;
  fi
}

_waiting_for_validation() {
	for attempt in 1 2 3 4 5
	do
		sleep $((4*attempt))
		RESPONSE="$(api_request "${ORDER_URL}" "")"
		STATUS="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"status"\:\ "\([^"]*\)".*$/\1/')"
		log " check ${attempt}: status=${STATUS}"
		if [ "${STATUS}" != "pending" ];
		then
			break
		fi
	done
	case "${STATUS}" in
		ready)
			log "Validation successful."
			;;
		invalid)
			error "The server unsuccessfully validated your authorization challenge(s). Cannot continue."
			exit 1
			;;
		*)
			error "Timeout. Certificate order status is still \"${STATUS}\" instead of \"ready\". Something went wrong validating the authorization challenge(s). Cannot continue."
			exit 1
	esac

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
	date_now_s=$(date +%s)
	echo "$((date_now_s + RENEW_ALLOW*24*60*60))"
}

# 是否是zsh
_is_zsh() {
  [ -n "${ZSH_VERSION-}" ]
}

# has function
_has() {
  echo '检查function是否可用'
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

# base64url encoding
_base64url() {
	# replace "+" with "-"
	# replace "/" with "_"
	# replace "=*$" with ""
	base64 -w 0 | sed 's/+/-/g' | sed 's/\//_/g' | sed 's/=*$//g'
}

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

_is_alias() {
  # this is intentionally not "command alias" so it works in zsh.
  \alias "${1-}" >/dev/null 2>&1
}

# 获取服务端口
_get_server_port() {
  case "$SERVER_TYPE" in
    "https")
      _SERVICE_PORT=443
      ;;
  esac
}

# 获取package.json中name
_get_package_name() {
	if [[ -n $_APP_NAME ]]; then echo $_APP_NAME; return; fi

  local package=${_ROOT}/package.json
  _APP_NAME=$(cat $package | grep '"name"' | awk -F ":" '{print $2}' | sed 's/[", ]//g')
  echo $_APP_NAME
  unset n package
}

# 获取package.json中version
_get_package_version() {
	if [[ -n $_APP_VERSION ]]; then echo $_APP_VERSION; return; fi

  local package=${_ROOT}/package.json
  _APP_VERSION=$(cat $package | grep '"version"' | awk -F ":" '{print $2}' | sed 's/[", ]//g')
  echo $_APP_VERSION
  unset package
}

# 确保存在git仓库目录
_get_git_commit_hash() { 
	if [[ -n $_COMMIT_HASH ]]; then echo $_COMMIT_HASH; return; fi

  _check_git_ready;
  git_head="$(cat ${_ROOT}/.git/HEAD)"
  _COMMIT_HASH="$(cat "${_ROOT}/.git/${git_head:5}")";
  echo $_COMMIT_HASH;
}

_get_git_branch_name() { 
	if [[ -n $_BRANCH_NAME ]]; then echo $_BRANCH_NAME; return; fi

  _check_git_ready;
  git_head="$(cat ${_ROOT}/.git/HEAD)"
  _BRANCH_NAME=${git_head##*/};
  echo $_BRANCH_NAME
}

# get the current operation system name
_get_os() {
	if [[ -n $_OS ]]; then echo $_OS; return; fi

  uname_res=$(uname -s)
	if [[ ${uname_res} == "Linux" ]]; then
    _OS="linux"
  elif [[ ${uname_res} == "FreeBSD" ]]; then
    _OS="bsd"
  elif [[ ${uname_res} == "Darwin" ]]; then
    _OS="mac"
  else
    _OS="unknown"
  fi

  echo $_OS
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

_build_ui() {
  echo 'build';
}

# 获取utc时间
_utc_date() { 
  date -u "+%Y-%m-%d %H:%M:%S"
}

_check_git_ready() {
  if [[ ! -d $_ROOT/.git ]]; then 
    git -C $_ROOT init
  fi
  return 0;
}

# 提交一次变更
_commit_and_push() {

  if [[ ! -n $(git diff HEAD) ]]; then
    git -C $_ROOT add -A
    git -C $_ROOT commit -m "$(date "+%Y%m%d")_自动化提交"
  fi

  read -r -p "是否需要上传远程仓库? [Y/n] " input

  case "$input" in
    [yY][eE][sS]|[yY] )
      echo "提交至远程仓库"; 
      git -C $_ROOT push master
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

_error_exit() {
  echo -e "$(_get_package_name): ${1:-"Unknown Error"}" >&2
  exit 1
}

_info() { # Write infomation if QUIET is set 0
  if [[ $_QUIET -eq 0 ]]; then
    echo "$@"
  fi
}

# 打印调试信息
_debug() {
	if [[ $(_get_debug_switcher) == "true" ]]; then
    echo "DEBUG: $@" >&2
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
    _debug "HAS_HOST=true"
    HAS_HOST=true
  fi
}

# copy a file, useing scp,sftp,or ftp if required.
_copy_file() {
	echo 'test';

}


# get curl useragent
_get_curl_useragent() {
  if [[ -n $_CURL_USERAGENT ]]; then echo $_CURL_USERAGENT; return; fi
  _CURL_USERAGENT="$(_get_package_name)/$(_get_package_version)"
  echo $_CURL_USERAGENT
}

_get_curl_version() {
  curl -V | command awk '{ if ($1 == "curl") print $2 }' | command sed 's/-.*$//g'
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

  case "$_OS" in
    Linux )
      ;;
    Darwin )
      ;;
    * )
      ;;
  esac

  _debug "detected os type = $_OS"

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

# print color text
_printf() {
	# print green
	printf '\33[1;32m%b\33[0m' "$1"
}

# to UpperCase
_toUpperCase() {
	tr 'a-z' 'A-Z'
}

# to LowerCase
_toLowerCase() {
	tr 'A-Z' 'a-z'
}

# give error message on error exit
_error() {
	echo -e "${_get_package_name}: ${1:-"Unknow Error"}" >&2
}

_exit_graceful() {
  cd $_ORIG_PWD; 
	exit 0
}

# 提供脚本退出时需要执行的任务
_exit() {
  # 恢复当前目录,并退出脚本程序
  cd $_ORIG_PWD; 
  exit $@;
}

# hex to binary
_hex2bin() {
	_require xxd;
	 xxd -p -r
  #echo -e -n "$(cat | os_esed -e 's/[[:space:]]//g' -e 's/^(.(.{2})*)$/0\1/' -e 's/(.{2})/\\x\1/g')"
}

# remove newlines and duplicate whitespace
_flatstring() {
	tr -d '\n\r' | sed 's/[[:space:]]\+/ /g'
}

# make a ACME API request
# $1 URL
# $2 body
# output on stdout
_make_a_acme_api_request() {
	URL=$1
	BODY=$2

	#get a new nonce by HEAD to newNonce API
	_debug "获取一个nonce"
	NONCE=$(
		curl --silient --head $(_ACME_API)/acme/new-nonce \
		| grep -i '^replay-nonce: ' \
		| sed 's/^replay-nonce: //i'
		| tr -d '\n\r'
		| sed 's/[[:space:]]\+/ /g'
	);

	_debug "nonce = $NONCE"

	# json web signature
	HEADER="{ \"alg\": \"RS256\", ${JWS_AUTH}, \"nonce\": \"${NONCE}\", \"url\": \"${URL}\"}"
	JWS_PROTECTED=$(printf "%s" "${HEADER}" | _base64url)
	JWS_PAYLOAD=$(printf "%s" "${BODY}" | _base64url)
	JWS_SIGNATURE=$(printf "%s" "${JWS_PROTECTED}.${JWS_PAYLOAD}" | openssl dgst
-sha256 -sign "${ACCOUNT_KEY}" | _base64url)
	JWS="{ \"protected\": \"${JWS_PROTECTED}\", \"payload\": \"${JWS_PAYLOAD}\", \"signature\": \"${JWS_SIGNATURE}\" }"

	_debug "Request URL: ${URL}"
	_debug "JWS Header: ${HEADER}"
	_debug "JWS BODY: ${BODY}"

	# base64 encoding/decoding necessary to stay binary safe.
	# e.g. the new-cert operation responds with a der encoded certificate.
	CURLOUT=$(curl --silent --include --show-error --write-out "\\n%{http_code}" -X POST -H "Content-Type: application/jose+json" -d "${JWS}" "${URL}" | base64 -w 0)

	HTTP_CODE=$(echo "${CURLOUT}" | base64 -d | tail -n 1)
	RESPONSE=$(echo "${CURLOUT}" | base64 -d | head -n -1)

	# just in case we get a 2xx status code but an error in response body
	ACMEERRORCHECK=$(echo ${RESPONSE} | _flatstring | sed 's/^.*"type": "urn:acme:error.*$/ERROR/')
	
	if { [ $HTTP_CODE = "200" ]  || [ $HTTP_CODE = "201" ] || [ $HTTP_CODE = "202" ]; } && [ $ACMEERRORCHECK != "ERROR"];
	then
		_debug "API request successful"
	else
		_debug "API request error"
		_debug "Request URL: ${URL}"
		_debug "HTTP status: ${HTTP_CODE}"
		_debug "${RESPONSE}"
		return 1;
	fi

	# do not echo RESPONSE bug decode again from base64 encoded curl output ot stay binary safe
	echo "${CURLOUT}" | base64 -d | head -n -1
	return 0
}

# 重启服务
_restart_service() {
  echo "重启服务"
}

# 停止服务
_stop_service() {
  echo "停止服务"

}

# 安装cert
_install_cert() {
  echo "准备安装cert"
}


_install_node_modules() {
  cd $_ROOT;
  npm --registry=https://registry.npm.taobao.org install
  cd $_ORIG_PWD;
}

# 判断当前用户是否为root
_is_root() {
  if [ $UID -eq 0 ]; then echo true; else echo false; fi;
}

################################################################################
# 检查依赖的函数
################################################################################

_require git
_require host
_require openssl 

################################################################################
# 执行环境设置
################################################################################

# 执行过程中返回值为非零，退出执行
set -e

################################################################################
# 定义shell变量
# 命名规则:全局变量以"_"开头或连接大写命名字母
#
# defined readonly variables `declear -r` equivalent to "readonly variable"
# defined exported variables `declear -x` equivalent to `export variable`
################################################################################

declare -r _ARGV=$@                                   # 记录原始的参数
declare -r _DIR=$(cd $(dirname $0) || exit; pwd -P;)  # 获取目录路径
declare -r _FILE=${0##*/}                             # 获取文件名称
declare -r _ROOT=$(dirname $_DIR)                     # 获取脚本根目录路径
declare -x PATH="${PATH}:${_ROOT}/bin"								# 附加PATH路径
declare -r _ACME_API="https://acme-v02.api.letsencrypt.org"
declare -r _ACME_API_STAGING="https://acme-staging-v02.api.letsencrypt.org"

declare -r _ORIG_CMD="$0 $*"                          # 记录原始参数以备再次执行
declare -r _ORIG_PWD=$(pwd)                           # 记录执行当前命令所在目录
declare -r _ORIG_UMASK=$(umask)                       # 记录原始umask值

# 检查_ROOT目录是否存在.env配置文件
declare -r _HAS_DOT_ENV=$([[ -r ${_ROOT}/.env ]] && echo "true" || echo "false")

# ENV环境设置
declare -rx _ENV=$(
  if [[ $_HAS_DOT_ENV == 'true' ]]; then 
    v=$(cat ${_ROOT}/.env | grep 'ENV=' | awk -F "=" '{ printf $2 }')
    if [[ $v == 'development' ]]; then 
      echo 'development'; 
    else 
      echo 'production'; 
    fi
  else 
    echo 'production'; 
  fi
);

declare -rx _QUITE=false        # 静默模式
declare -rx _CHECK_UPGRADE=true # 默认检查更新
declare _RENEW_ALLOW=30

################################################################################
# 解析命令行参数,执行相应程序
################################################################################

if [ ${#} -lt 1 ]; then
	_error "请提供执行参数"
	_help_message
	_exit 1
fi

while [[ ${#} -gt 0 ]]; do
	ARG=${1}
  case ${ARG} in
    -h | --help )
      _show_help_message; 
			exit 0;
			;;

    -v | --version )
      _show_version_message; 
			exit 0;
			;;

    -s | --start )
      _start_server; break
			;;

    --commit )
      _commit_and_push; break
			;;

    --deploy-pki )
      _deploy_pki_cert; break
			;;

    --install )
      _install_node_modules; break
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
