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
 * starter command --watch-paths='' --restart
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';

import settings from '../server/config/settings.mjs';
import { assert, argvParser, console } from '../src/utils.lib.mjs';
import { readDir } from '../src/utils.node.mjs';

const paths = settings.paths;
const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
const paramMap = argvParser(ARGVS);

//const command = paramMap.get('command');
const command = path.join(paths.BIN, 'httpd.mjs');
assert(command, '请提供要执行的命令!');

const ps = paramMap.get('paths').split(',');
assert(ps.length, '请提供要监测的目录!');

//const args = paramMap.get('args');
const args = ['--restart'];

let cmd = null;
let lastPid = null;

process.nextTick(() => new Watcher(...ps, () => {
  cmd = cp.spawn(command, args, { 
    stdio: [0, 1, 2], 
    detached: false 
  });
  console.clear();
  console.log(`${lastPid ? `(PID:${lastPid})进程退出 ` : ''}(PID:${cmd.pid})启动...`);
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
      clearTimeout(this.timeout); 
      this.timeout = setTimeout(() => callback(), 2000);
    });

    setInterval(() => this.detect(), 1500); // 每隔s秒检测一次目录变动
  }

  detect () {
    const files = readDir(this.paths);

    for (let file of files) {
      if (!fs.existsSync(file)) return;
      if (path.basename(file) === '.DS_Store') {
        fs.unlinkSync(file);
        continue;
      }

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
