#!/bin/sh

if [[ ! -d $1 ]]; then echo $1; fi

for file in `ls $1`
do
  if [[ -d ${1}/$file ]]; then
    _read_dir ${1}/$file
  else
    echo ${1}/$file
  fi
done

unset dir
