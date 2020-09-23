#!/usr/bin/env node
/**
 * *****************************************************************************
 * 
 * 监测目录,当文件发生变动时触发change事件,并执行指定的命令
 *
 * 使用方法:
 *
 * ```
 * watcher.mjs --paths=server --command=starter.mjs --args=
 * ```
 * *****************************************************************************
 */

import cp from 'child_process';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';

import { assert, argvParser, } from '../src/utils/index.mjs';
import readDir from '../src/utils/readDir.mjs';

// 默认开发环境
process.env.NODE_ENV = 'development'; 
process.env.NODE_DEBUG = 'debug:*';

const ARGVS = Array.prototype.slice.call(process.argv, 2); // get argv array
const paramMap = argvParser(ARGVS);

const command = paramMap.get('command');
assert(command, '请提供要执行的命令!');

const paths = paramMap.get('paths').split(',');
assert(paths.length, '请提供要监测的目录!');

process.nextTick(() => new Watcher(...paths, () => {
  const args = paramMap.get('args').split(' ');
  cp.spawn(command, args, { stdio: [0, 1, 2], detached: false });
})); 

/**
 * 目录监测器
 */

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
