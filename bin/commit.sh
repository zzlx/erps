#!/bin/sh

# 传递参数列表并执行 $@ 表示所有参数, $n 表示第n个参数
# 获取代码库根目录位置
APP_WORK_TREE=$(dirname $(cd $(dirname $0); pwd))

# -C 指定工作目录 

_commit_and_push() {

  if [ -d "$APP_WORK_TREE/.git" ];then
    git -C $APP_WORK_TREE add -A .
    git -C $APP_WORK_TREE commit -m "$(date "+%Y%m%d")_自动化提交"
  else
    git -C $APP_WORK_TREE init
    return
  fi

  echo "自动化提交完成"
}

_commit_and_push
