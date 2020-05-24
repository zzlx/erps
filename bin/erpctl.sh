#!/usr/bin/env bash
################################################################################
#
# EPR服务管理脚本
#
# 功能特性:
# * 提供源代码库版本管理及变更提交
# * 服务启动、停止、重启等操作
# * 服务器证书申请或自签名证书等签发
#
# All rights reserved. zzlx.org 立行信息技术
# EMail: wangxuemin@zzlx.org
################################################################################

################################################################################
# 定义shell函数

# 显示帮助信息
_show_help_message() { 
  cat <<- EOF
	Usage: $(_print_red $(_get_package_name | _toLowerCase)) [options...]

	Options:
		-h, --help        显示帮助信息
		-v, --version     显示版本号

		环境设置参数
		--env [development|production]  运行环境配置

		服务管理参数
		--start           启动服务
		--stop            停止服务
		--restart         重启服务

		代码库管理参数
		--build           重建前端程序
		--commit          提交一次代码库改动
		--show-git-log    显示git版本日志
		--install         系统初始化安装与配置

		系统测试参数
		--test            测试
	EOF
}

# 显示版本信息
_show_version_message() {
  cat <<- EOF
	Version: $(_get_package_version)
	GitBranch: $(_get_git_branch_name)
	GitHash: $(_get_git_commit_hash)
	EOF
}

# remove files
_rm() {
	_debug '_rm';
	local trash_dir="$HOME/.trash_temp"
	if [[ ! $(mkdir -p $trash_dir) ]]; then return; fi

	for i in $*; do
		timestamp=$(date +%s)
		filename=$(basename $i)

		if [[ -r $i ]]; then
			mv $i ${trash_dir}/${filename}.${timestamp}
		fi
	done

	unset trash_dir
}

# get url of current subscriber agreement
_get_agreement() {
	AGREEMENT=$(curl --silent ${_ACME_API}/directory \
		| grep '"termsOfService":' \
		| sed 's/^.*"termsOfService": "\([^"]*\)".*$/\1/' \
		| _flatstring
	)
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

_stop_httpd() {
	_debug "停止httpd服务..."
	set -e
	# step1: 获取httpd pid
	httpdPid=$(_get_httpd_pid)

	# step2: kill httpdPid
	if [[ -n $httpdPid ]]; then
		echo "PID:${httpdPid}进程正在关闭..."
		kill -9 $httpdPid 2>/dev/null # 错误信息重定向
		rm -f $HOME/.node.httpd.pid
		echo "进程PID:${httpdPid}已经关闭."
	fi

}

_start_httpd() {
	if [[ -n $(_get_httpd_pid)  ]]; then
		printf "服务正在运行,重启服务请使用'--restart'参数."
		return;
	fi

	export NODE_ENV=${_ENV}
	export IPV6=true

	if [[ $(_get_debug_setting) == 'true' ]]; then
		export NODE_DEBUG="debug*"
	fi

	# 启动httpd服务
	node --no-warnings --experimental-json-modules \
		${_ROOT}/src/server/main.mjs \
		&

	if [[ $_ENV == 'development' ]]; then
		# @todo: 监控src目录下文件改动时,再重启服务
		_debug "开发环境下间隔60s,重启服务"
		sleep 60
		$_ORIG_CMD --restart
	fi 
}

_restart_httpd() {
	# step1: stop httpd
	_stop_httpd

	# step2: start httpd
	_start_httpd
}

_get_pid_by_name() {
	local name=$1
	ps -ef | grep "$name" | grep -v "$_ORIG_TASK\|grep" | awk '{print $2}'
	unset name
}

_get_httpd_pid() {
	local pidFile="${HOME}/.node.httpd.pid"

	if [[ -r $pidFile ]]; then
		pid=$(head -n 1 $pidFile | sed 's/\n//g')
		if [[ -n $pid ]]; then 
			echo $pid; 
		else
			rm -f $pidFile
		fi
	fi	

	unset pidFile
}

# 签发自签名证书
_issue_self_signed_certificate() {
	local domain=$(hostname | awk '{printf $1}')
	local keyFile="${_ORIG_PWD}/${domain}-key.pem"
	local csrFile="${_ORIG_PWD}/${domain}-csr.pem"
	local certFile="${_ORIG_PWD}/${domain}-crt.pem"

	_debug '任务1: 创建private key'
	openssl genrsa -out $keyFile 2048

	_debug '任务2: 生成csr'
	openssl req -new -sha256 -key $keyFile -out $csrFile -days 365

	_debug '任务3: 签发自签名证书'
	openssl x509 -req -in ${csrFile} -signkey ${keyFile} -out ${certFile}
}

# 获取进程id号
_get_process_id() {
  process=$1
  pid=$(ps -ef | grep $process | grep '/bin/java' | grep -v grep | awk '{print $2}')
  echo $pid
}

# 获取调试开关设置
_get_debug_setting() {
	if [[ -n $_DEBUG ]]; then echo $_DEBUG; return; fi

  if [[ $_HAS_DOT_ENV == 'true' ]]; then 
    v=$(cat ${_ROOT}/.env | grep '^DEBUG=' | sed 's/\n//g' | awk -F "=" '{ printf $2 }')
    if [[ $v == 'true' ]]; then _DEBUG='true'; fi
    if [[ $v == 'false' ]]; then _DEBUG='false'; fi
  fi

	if [[ -z $_DEBUG ]]; then 
		if [[ $_ENV == 'development' ]]; then 
			_DEBUG='true'; 
		else
			_DEBUG='false'; 
		fi
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

# 创建CSR文件
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

	RESPONSE=$(_acme_api_request ${CERTIFICATE_URL} "");

	# 相应包含服务器及中间证书,存储导一个链表文件
	echo "${RESPONSE}" | awk '/-----BEGIN CERTIFICATE-----/,0' > "${DOMAIN}/${DOMAIN}.crt"
	echo "Succcess!"

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
			_error $DOMAIN - certificate obtained but certificate on server is different from the new certificate.
		fi


	fi
}

# 注册登记账户
_registering_account() {
	if [ -n "$CONTACT_EMAIL" ]; then
		REQUEST="{ \"termsOfServiceAgreed\": true, \"contact\": [ \"mailto:${CONTACT_EMAIL}\" ] }"
	else
		REQUEST="{ \"termsOfServiceAgreed\": true }"
	fi

	RESPONSE=$(_acme_api_request "${_ACME_API}/acme/new-acct" "${REQUEST}")
	ACCOUNT_URL=$(echo "${RESPONSE}" | grep -i '^location: ' | sed 's/^location: //i' | _flatstring)

	# api authentication by account URL from now on
	JWS_AUTH="\"kid\": \"${ACCOUNT_URL}\""

}

# generate a private key(if it doesn`t already exist)
_generate_private_key() {
	key_type=${1:-rsa}
	key_loc=${2}
	key_len=${3}

	#check if key exists, if not then create it
	if [[ -s "$key_loc" ]]; then
		_debug "private key exists at $key_log - skipping regeneration"
	else
		umask 077
		echo "creating private key - $key_loc"
		case "${key_type}" in
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

# 清除.well-known
_cleanup_well_know() {
	if [[ -n "${WEBROOT}" ]]; then
		echo "删除challenge token"
	fi
}

# create a public key
_create_public_key() {
	privateKey=$1
	echo $(openssl rsa -in $privateKey -pubout)
}

_create_order() {
	REQUEST="{ \"identifiers\": ["
	for (( i=0; i < ${#DOMAINS[@]}; i++ ))
	do
		REQUEST="${REQUEST} { \"type\": \"dns\", \"value\": \"${DOMAINS[$i]}\" }"
		if [ $i -lt $((${#DOMAINS[@]}-1)) ]; then REQUEST="${REQUEST},"; fi
	done
	REQUEST="${REQUEST} ] }"
	RESPONSE="$(_acme_api_request "${API}/acme/new-order" "${REQUEST}")"
	ORDER_URL=$(echo "${RESPONSE}" | grep -i '^location: ' | sed 's/^location: //i' | flatstring)
	IFS=" " read -r -a AUTHORIZATION_URLS <<< "$(echo "${RESPONSE}" | flatstring | sed 's/^.*"authorizations"\:\ \[\ \(.*\)\ \].*$/\1/' | tr -d ',"')"
	debug "authorization_urls=${AUTHORIZATION_URLS[*]}"
	if [ ${#DOMAINS[@]} -ne ${#AUTHORIZATION_URLS[@]} ];
	then
		debug "${RESPONSE}"
		error "Number of returned authorization URLs (${#AUTHORIZATION_URLS[@]}) does not match the number your requested domains (${#DOMAINS[@]}). Cannot continue."
		exit 1
	fi
	FINALIZE_URL="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"finalize"\:\ "\([^"]*\)".*$/\1/')"
	debug "finalize_url=${FINALIZE_URL}"
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

# get jwk thumbprint
_get_jwk_thumbprint() {
	# account public key exponent
	# formatting: Exponent dec => hex => binary => base64url
	# e.g. 65537 => 0x010001 => ... => AQAB
	# printf 0.32 and cutting 00 in pairs makes sure we have even number of digits for hexbin
	JWK_E="$(openssl rsa -pubin -in "${ACCOUNT_PUB}" -text -noout | grep ^Exponent | awk '{ printf "%0.32x",$2; }' | sed 's/^\(00\)*//g' | hexbin | base64url)"

	# account public key modulus
	JWK_N="$(openssl rsa -pubin -in "${ACCOUNT_PUB}" -modulus -noout | sed 's/^Modulus=//' | hexbin | base64url)"

	# API authentication by JWK until we have an account
	JWS_AUTH="\"jwk\": { \"e\": \"${JWK_E}\", \"kty\": \"RSA\", \"n\": \"${JWK_N}\" }"

	# Important: no whitespaces at all. The server computes the thumbprint from our
	# E and N values in JWK and does so with this exact JSON. The sha256 from us
	# will not match theirs if we use a different JSON formatting.
	# see example in https://tools.ietf.org/html/rfc7638
	JWK_THUMBPRINT="$(printf "%s" "{\"e\":\"${JWK_E}\",\"kty\":\"RSA\",\"n\":\"${JWK_N}\"}" | openssl dgst -sha256 -binary | base64url)"

}

# 
_validation_via_http() {
	echo '验证http';
	if [ -n "${WEBROOT}" ];
	then
		echo "Copying challenge tokens to DocumentRoot ${WEBROOT} ..."
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
		echo "Done"
	else
		echo "Execute in your DocumentRoot:"
		echo
		echo
		echo "mkdir -p .well-known/acme-challenge"
		for (( i=0; i < ${#DOMAINS[@]}; i++ ))
		do
			echo "echo '${KEYAUTHS[$i]}' > .well-known/acme-challenge/${CHALLENGE_TOKENS[$i]}"
		done
		echo
		echo
		echo "Press [Enter] when done."
		read -r
	fi
}

# 响应一次挑战
_responsd_to_challenges() {
	for (( i=0; i < ${#DOMAINS[@]}; i++ ))
	do
		debug "${CHALLENGE_URLS[$i]}"
		RESPONSE="$(_acme_api_request "${CHALLENGE_URLS[$i]}" "{}")"
	done
}

_npm_install() {
  if [[ ! -d ${_ROOT}/node_modules ]]; then
    cd $_ROOT; npm install; cd $_PWD;
  fi
}

_waiting_for_validation() {
	for attempt in 1 2 3 4 5
	do
		sleep $((4*attempt))
		RESPONSE="$(_acme_api_request "${ORDER_URL}" "")"
		STATUS="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"status"\:\ "\([^"]*\)".*$/\1/')"
		log " check ${attempt}: status=${STATUS}"
		if [ "${STATUS}" != "pending" ];
		then
			break
		fi
	done
	case "${STATUS}" in
		ready)
			echo "Validation successful."
			;;
		invalid)
			_error "The server unsuccessfully validated your authorization challenge(s). Cannot continue."
			_exit 1
			;;
		*)
			_error "Timeout. Certificate order status is still \"${STATUS}\" instead of \"ready\". Something went wrong validating the authorization challenge(s). Cannot continue."
			_exit 1
	esac

}

# deploy pki private key and certificate
_deploy_pki_cert() {
	if [[ ${_IS_ROOT} == 'false' ]]; then
		echo "需要系统管理权限, 请使用\"sudo $_ORIG_TASK\"执行此任务"
		sudo $_ORIG_TASK
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
# 从stdin获取input,处理后输出至stdout
_base64url() {
	# replace "+" => "-" "/" =>"_" "=*$" => ""
	if [[ $(_get_os) == 'linux' ]]; then
		base64 -w 0 | sed 's/+/-/g' | sed 's/\//_/g' | sed 's/=*$//g'
	fi

	if [[ $(_get_os) == 'mac' ]]; then
		base64 -b 0 | sed 's/+/-/g' | sed 's/\//_/g' | sed 's/=*$//g'
	fi

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

	# 比对工作区与暂存区
	# 如果出现差异,则进行暂存
  if [[ -n $(git -C $_ROOT diff --cached) ]]; then echo '执行暂存'; fi

	# 比对工作区与仓库差异
  if [[ -n $(git -C $_ROOT diff HEAD) ]]; then
    git -C $_ROOT add -A
    git -C $_ROOT commit -m "$(date "+%Y-%m-%d %H:%M:%S") 自动化提交"
  fi

	read -r -p "是否需要上传远程仓库? /Y(es)?|No?/i " input

  case "$input" in
    [yY][eE][sS]|[yY] )
      echo "提交至远程仓库"; 
      git -C $_ROOT push
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

# 解析json文本,取出字段值 @todo: 未完成
_get_json_value() {
  if [[ -z "$1" ]] || [[ "$1" == "null" ]]; then
    echo "json was blank"
    return
  fi
  echo "$2";
}

_error() {
	# 将消息定向到stderr
  echo -e "$(_get_package_name): ${1:-"Unknown Error"}" >&2
}

# 调试信息
_debug() {
	# 调试信息定向至2 => stderr, 以避免调试信息成为函数返回到一部分 
	if [[ $(_get_debug_setting) == "true" ]]; then echo "DEBUG $@" >&2; fi
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
_print_green() {
	printf '\33[1;32m%b\33[0m' "$1" # print green
}

# print color text
_print_red() {
	printf '\33[1;31m%b\33[0m' "$1" # print green
}

# to UpperCase
_toUpperCase() {
	tr 'a-z' 'A-Z'
}

# to LowerCase
_toLowerCase() {
	tr 'A-Z' 'a-z'
}

# echo error message on error exit
_echo_error() {
	echo -e "${_get_package_name}: ${1:-"Unknow Error"}" >&2
}

# 提供脚本退出时需要执行的任务
_exit() {
  # 恢复到程序执行时所在目录,并退出脚本程序
  cd $_ORIG_PWD; exit $@;
}

# 将16进制字符转为2进制
_hex2bin() {
  #echo -e -n "$(cat | os_esed -e 's/[[:space:]]//g' -e 's/^(.(.{2})*)$/0\1/' -e 's/(.{2})/\\x\1/g')"
	 xxd -p -r
}

# 过滤字符串
_flatstring() {
	# remove newlines and duplicate whitespace
	tr -d '\n\r' | sed 's/[[:space:]]\+/ /g'
}

# ACME API请求
_acme_api_request() {
	URL=$1
	BODY=$2

	#get a new nonce by HEAD to newNonce API
	_debug "获取一个nonce..."
	NONCE=$(
		curl --silient --head $(_ACME_API)/acme/new-nonce \
		| grep -i '^replay-nonce: ' \
		| sed 's/^replay-nonce: //i'
		| tr -d '\n\r'
		| sed 's/[[:space:]]\+/ /g'
	);

	_debug "nonce = $NONCE"

	# JSON web signature
	HEADER="{ \"alg\": \"RS256\", ${JWS_AUTH}, \"nonce\": \"${NONCE}\", \"url\": \"${URL}\"}"

	JWS_PROTECTED=$(printf "%s" "${HEADER}" | _base64url)
	JWS_PAYLOAD=$(printf "%s" "${BODY}" | _base64url)

	JWS_SIGNATURE=$(printf "%s" "${JWS_PROTECTED}.${JWS_PAYLOAD}" | openssl dgst -sha256 -sign "${ACCOUNT_KEY}" | _base64url)
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
	
	if { [ $HTTP_CODE = "200" ]  || [ $HTTP_CODE = "201" ] || [ $HTTP_CODE = "202" ]; } && [ $ACMEERRORCHECK != "ERROR"]; then
		_debug "API request successful"
	else
		_debug "API request error"
		_debug "Request URL: ${URL}"
		_debug "HTTP status: ${HTTP_CODE}"
		_debug "${RESPONSE}"
		return 1;
	fi

	# do not echo RESPONSE but decode again from base64 encoded curl output to stay binary safe
	echo "${CURLOUT}" | base64 -d | head -n -1
	return 0
}

# 请求证书订单
_order_cert() {
	CSR="$(openssl req -in "${DOMAIN}/${DOMAIN}.csr" -inform PEM -outform DER | base64url)"
	REQUEST="{ \"csr\": \"${CSR}\" }"
	RESPONSE="$(api_request "${FINALIZE_URL}" "${REQUEST}")"
	STATUS="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"status"\:\ "\([^"]*\)".*$/\1/')"
	debug "status=${STATUS}"
	if [ "${STATUS}" != "valid" ];
	then
		debug "${RESPONSE}"
		error "Certificate order status is \"${STATUS}\" instead of \"valid\". Something went wrong issuing the certificate. Cannot continue."
		exit 1
	fi
	CERTIFICATE_URL="$(echo "${RESPONSE}" | flatstring | sed 's/^.*"certificate"\:\ "\([^"]*\)".*$/\1/')"
	debug "certificate_url=${CERTIFICATE_URL}"
	log "OK"
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
# 预设执行环境
set -e # 执行过程中返回值为非零，退出执行
# trap _exit EXIT

################################################################################
# 检查依赖的函数
_require git
_require host
_require openssl 

################################################################################
# 定义shell变量
# 命名规则:全局变量以"_"开头或连接大写命名字母
#
# defined readonly variables `declear -r` equivalent to "readonly variable"
# defined exported variables `declear -x` equivalent to `export variable`

declare -r _ORIG_CMD="$0"                             # 记录原始命令 
declare -r _ARGV=$@                                   # 记录原始的参数
declare -r _ORIG_TASK="$0 $*"                         # 记录原始命令任务
declare -r _ORIG_PWD=$(pwd)                           # 记录执行当前命令所在目录
declare -r _ORIG_UMASK=$(umask)                       # 记录原始umask值

declare -r _FILE=${0##*/}                             # 获取文件名称
declare -r _DIR=$(cd $(dirname $0) || exit; pwd -P)   # 获取目录路径
declare -r _ROOT=$(dirname $_DIR)                     # 获取脚本根目录路径
declare -rx PATH=$PATH:$_ROOT/bin                      # 添加bin至PATH路径

# 检查_ROOT目录是否存在.env配置文件
declare -r _HAS_DOT_ENV=$([[ -r ${_ROOT}/.env ]] && echo "true" || echo "false")

# ENV环境设置
declare +r _ENV=$(
  if [[ $_HAS_DOT_ENV == 'true' ]]; then 
    v=$(cat ${_ROOT}/.env | grep '^ENV=' | awk -F "=" '{ printf $2 }')
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

# letsencrypt`s ACME service API address
_ACME_API="https://acme-v02.api.letsencrypt.org"
_ACME_API_STAGING="https://acme-staging-v02.api.letsencrypt.org"

################################################################################
# 解析命令行参数,执行指令

if [ ${#} -lt 1 ]; then
	_error "请提供执行参数"
	_show_help_message
	_exit 1
fi

while [[ ${#} -gt 0 ]]; do
	ARG=${1}
	case ${ARG} in
		-h | --help )
			_show_help_message; 
			_exit 0;
			;;

		-v | --version )
			_show_version_message; 
			_exit 0;
			;;

		--debug )
			_DEBUG="true"
			;;

		--env )
			shift
			if [[ $1 == 'development' ]]; then _ENV=$1; else _ENV='production'; fi
			;;

		--start )
			_start_httpd
			;;

		--stop )
			_stop_httpd;
			;;

		--restart )
			_restart_httpd;
			;;

		-t | --test )
			_DEBUG="true"
			_debug "使用staging API进行测试"
			_ACME_API=${_ACME_API_STAGING}
			;;

		--commit )
			_commit_and_push; break
			;;

		--get-pid )
			shift
			_get_pid_by_name $1; break
			;;

		--show-git-log )
			git -C $_ROOT log
			;;

		--deploy-pki )
			_deploy_pki_cert; break
			;;

		--npm-install )
			_npm_install; break
			;;

		# 签发自签名服务器证书
		--self-signed-certificate )
			_issue_self_signed_certificate;
			;;

		-c )
			echo -n "输入一些文本 > ";
			read text
			echo "你的输入：$text";
			;;

		* )
			echo "输入的参数${ARG} 不被支持.";
			;;
	esac
	shift
done
