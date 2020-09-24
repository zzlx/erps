#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * 守护进程启动器(Daemon Starter)
 * 
 * ## 功能
 *
 * * 监控源码目录,有变动时触发change事件重启服务
 * * 监控命令进程,退出时进行重启 
 * * 记录命令进程启动、退出情况
 * * ...
 *
 * ## 使用方法:
 *
 * ```
 * watcher.mjs --paths=server --command=starter.mjs --args='--restart'
 * ```
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';

import { assert, argvParser, console } from '../src/utils.mjs';
import readDir from '../src/utils/readDir.mjs';

const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
const paramMap = argvParser(ARGVS);

if (paramMap.has('devel')) {
  process.env.NODE_ENV = 'development'; 
  process.env.NODE_DEBUG = 'debug:*';
}

const command = paramMap.get('command');
assert(command, '请提供要执行的命令!');

const paths = paramMap.get('paths').split(',');
assert(paths.length, '请提供要监测的目录!');

const args = paramMap.get('args').split(' ');
let cmd = null;
let lastPid = null;

process.nextTick(() => new Watcher(...paths, () => {
  cmd = cp.spawn(command, args, { stdio: [0, 1, 2], detached: false });
  console.clear();
  console.log(`启动进程(PID:${cmd.pid}) ${lastPid ? `进程(PID:${lastPid})已退出` : ''}`);
  lastPid = cmd.pid;
})); 

class Watcher extends EventEmitter {
  constructor() {
    super();
    let callback = () => {};
    this.paths = Array.prototype.slice.call(arguments);

    if (typeof(this.paths[this.paths.length - 1]) === 'function') {
      callback = this.paths.pop();
    }

    this.db = new Map();

    // 提示监测的目录列表
    console.info('Watch paths: ', this.paths);

    callback(); // 先执行一次

    this.on('change', (file) => {
      if (this.timeout && this.timeout._destroyed == null) {
        clearTimeout(this.timeout); 
      }

      this.timeout = setTimeout(() => callback(), 2500); // 2.5秒内再次出现变动则取消上次
    });

    setInterval(() => this.detect(), 3000); // 每隔3秒检测一次目录变动
  }

  detect () {
    const files = readDir(this.paths);

    for (let file of files) {
      if (!fs.existsSync(file)) return;

      const content = fs.readFileSync(file, 'utf8');
      const sha1 = crypto.createHash('sha1').update(content).digest('hex');

      if (this.db.has(file) && this.db.get(file) !== sha1) {
        this.emit('change', file);
        this.db.set(file, sha1); // 存储改动后的哈希值
        break;
      }

      this.db.set(file, sha1); // 存储文件哈希值
    }
  }
}


/**
 *
 *
 * @param: {string} question
 * @param: {bool} password 是否显示*号代替输入字符 
 *
 */

function readFromStdin () {
  const question = arguments[0];

  process.stdout.write(String(question));

  return new Promise((resolve, reject) => {
    if (process.stdin.isPaused()) process.stdin.resume();
    process.stdin.setEncoding('utf8');

    process.stdin.on('data', (chunk) => {
      const input = String(chunk).trim();
      resolve(input);
      process.stdin.pause();
    });
  });
}
