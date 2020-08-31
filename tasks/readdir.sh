#!/bin/sh

function _read_dir () {

	if [[ ! -d $1 ]]; then 
		echo $1; 
		exit
	fi

	_PWD=$(cd $(dirname $1) || exit; pwd -P)
	echo ${_PWD}

	for file in `ls $1`
	do
		if [[ -d ${_PWD}/$file ]]; then
			_read_dir ${_PWD}/$file
		else
			echo ${_PWD}/$1/$file
		fi
	done

	unset _PWD
}

_read_dir $1
