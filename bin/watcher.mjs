#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * 脚本自动启动器
 * ==============
 *
 * 监视目录变动，当检测到文件改动时，重启指定的命令
 *
 * ## 使用方法:
 *
 * ```
 * watcher.mjs --path=server --command=starter.mjs --args=
 * ```
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import os from 'os';
import path from 'path';
import util from 'util';

import { assert, argvParser, } from '../server/utils.mjs';
import config from '../server/config/settings.mjs';
import FileWatcher from '../server/utils/FileWatcher.mjs';

const paths = config.paths;
let httpd = null;

process.nextTick(() => parseParams()); 

/**
 * 解析参数,并执行命令
 */

function parseParams () {
  // Task: Parse argvs
  const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
  const paramMap = argvParser(ARGVS);

  assert(paramMap.size == 0, 'There is nothing to do./@todo: Show help message.');

  // execute tasks
  for (let param of paramMap.keys()) {
    switch(param) {
      case 'command':
        paramMap.delete(param); // delete param key
        break;
      case 'args':
        paramMap.delete(param); // delete param key
        break;
      case 'paths':
        paramMap.delete(param); // delete param key
        break;
    }

    if (paramMap.size > 0) {
      console.log(`The param you provid is not supported.`);
    }
  }
}

function executer () {
  const args = [];
  const options = {
    detached: process.env.NODE_ENV === 'production' ? true : false,
    stdio: [0, 1, 2],
  };

  childProcess = cp.spawn(command, args, options);
}

function watcher () {
  new FileWatcher(
    path.join(paths.appRoot, 'server'),
    () => {
      console.log('服务正在重启...');
    },
  );
}
