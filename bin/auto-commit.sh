#!/bin/sh

# 传递参数列表并执行 $@ 表示所有参数, $n 表示第n个参数
# 获取代码库根目录位置
APP_WORK_TREE=$(dirname $(cd $(dirname $0); pwd))

if [ ! -d "$APP_WORK_TREE/.git" ]; then
  echo "请确认代码库已初始化"
  return 1
fi

_utc_date () {
  date -u "+%Y-%m-%d %H:%M:%S"
}

_date_serial_number () {
  date "+%Y%m%d"
}

_commit_and_push () {
  git -C $APP_WORK_TREE add -A .
  git -C $APP_WORK_TREE commit -m "$(date "+%Y%m%d")_自动化提交"
  echo "$(_utc_date) 自动化提交完成"
}

_commit_and_push
