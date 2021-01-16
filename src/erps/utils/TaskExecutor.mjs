/**
 * *****************************************************************************
 *
 * 任务执行器
 * 
 * *****************************************************************************
 */

import assert from 'assert';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';

import debuglog from './debuglog.mjs';
import readDir from './readDir.mjs';

const debug = debuglog('debug:task-executor');

export default class TaskExecutor extends EventEmitter {
  constructor(options = {}) {
    super();
    this.opts = Object.assign({}, {
      watchPath: [],
      callback: () => {},
      interval: 500,
    }, typeof options === 'string' ? { paths: options } : options);

    this.cache = new Map();

    this.on('detectComplete', () => {
      this.timeout = setTimeout(() => {
        this.detect();
      }, this.opts.inverval);
    });

    this.on('change', file => {
      debug(`监测到文件${file} 发生改动.`);

      if (this.onChangeTimer != null) {
        clearTimeout(this.onChangeTimer)
        debug(this.onChangeTimer);
        this.onChangeTimer = null;
      }

      this.onChangeTimer = setTimeout(this.opts.callback, this.opts.interval + 100);
    });

    this.detect();
  }


  detect () {
    const files = readDir(this.opts.watchPath); // 读取目录文件列表

    for (const file of files) {
      try {
        const content = fs.readFileSync(file, 'utf8');
        const sha1 = crypto.createHash('sha1').update(content).digest('hex');

        if (this.cache.has(file) && this.cache.get(file) !== sha1) {
          this.emit('change', file);
          this.cache.set(file, sha1); // 存储改动后的哈希值
          break;
        }

        this.cache.set(file, sha1); // 存储文件哈希值
      } catch (error) {
        // 读取文件出错时，时触发change事件
        this.emit('change', file);
        break;
      }
    }

    // 检测完成事件
    this.emit('detectComplete'); 
  }
}
