#!/usr/bin/env node
/**
 * *****************************************************************************
 *
 * starter
 *
 * auto restart server
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

import { 
  assert, 
  argvParser, 
  console 
} from '../src/utils.lib.mjs';

const ARGVS = Array.prototype.slice.call(process.argv, 3); // get argv array
const params = argvParser(ARGVS);

const paths = params['paths'] ? params['paths'].split(',') : process.cwd();
delete params['paths']

if (process.argv[2] == null) process.exit();
const command = path.join(process.cwd(), process.argv[2] || '');

const args = [];

for (let key of Object.keys(params)) {
  args.push(`--${key}${params[key] === true ? '' : '=' + params[key]}`);
}

let cmd = null;
let lastPid = null;

process.nextTick(() => new Watcher(...paths, () => {
  cmd = cp.spawn(command, args, { 
    stdio: [0, 1, 2], 
    detached: false 
  });
  console.clear(); // clear console
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
      this.timeout = setTimeout(() => callback(), 1000); // 延时1s种执行任务
    });

    setInterval(() => this.detect(), 850); // 每隔850ms检测一次目录变动
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

/**
 * 循环读取目录,返回文件路径列表
 *
 * @param {string} dir
 */

function readDir (dir) {
  let file_lists = []; // 文件列表
  
  if (Array.isArray(dir)) {
    for (let d of dir) file_lists = file_lists.concat(readDir(d));
  }

  if (typeof dir === 'string' && fs.existsSync(dir)) {

    const files = fs.readdirSync(dir, {withFileTypes: true});

    for (let file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) file_lists.push(filePath);
      if (file.isDirectory()) file_lists = file_lists.concat(readDir(filePath));
    }
  }

  return file_lists;
}
