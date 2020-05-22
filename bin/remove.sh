#!/usr/bin/env bash
# 用于将文件移动到回收站

trash_dir="$HOME/.trash_temp"
mkdir -p $trash_dir

for i in $*; do
	timestamp=$(date +%s)
	filename=$(basename $i)

	if [[ -r $i ]]; then
		mv $i ${trash_dir}/${filename}.${timestamp}
	fi
done
