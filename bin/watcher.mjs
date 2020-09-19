#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * 开发环境下监测目录中文件改动，用于重启指定的命令
 *
 * ## 使用方法:
 *
 * ```
 * watcher.mjs --paths=server --command=starter.mjs --args=
 * ```
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import os from 'os';
import path from 'path';
import util from 'util';

import { assert, argvParser, } from '../src/utils/index.mjs';
import FileWatcher from '../src/utils/FileWatcher.mjs';

const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
const paramMap = argvParser(ARGVS);

let childProcess = null;

let command = paramMap.get('command');
assert(command, '请提供要执行的命令!');
command = command[0] === '/' ? command : path.join(process.cwd(), command);
const paths = paramMap.get('paths').split(',');
assert(paths.length, '请提供要监测的目录!');
const args = paramMap.get('args').split(' ');

process.env.NODE_ENV = 'development'; // 默认开发环境
process.env.NODE_DEBUG = 'debug:*'; // 默认开发环境

console.log('Watch paths: ', paths);

process.nextTick(() => new FileWatcher(...paths, () => {
  cp.spawn(command, args, { stdio: [0, 1, 2], detached: false, });
})); 
