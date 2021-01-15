/**
 * *****************************************************************************
 *
 * 监视目录文件变动,触发change事件
 * 
 * Events:
 *
 * * change
 *
 *
 * *****************************************************************************
 */

import assert from 'assert';
import path from 'path';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';
import readDir from './readDir.mjs';

export default class PathWatcher extends EventEmitter {
  constructor(options = {}) {
    super();
    this.opts = Object.assign({}, {
      paths: [],
      callback: () => {},
      interval: 800,
    }, typeof options === 'string' ? { paths: options } : options);

    this.cache = new Map();

    this.on('complete', () => {
      this.timeout = setTimeout(() => {
        this.detect();
      }, this.opts.inverval);
    });

    this.on('change', file => {
      if (this.onChangeTimer)
        this.onChangeTimer();
        this.onChangeTimer = null;
      }

      this.onChangeTimer = setTimeout(this.opts.callback, 500);
    });
  }

  /**
   * 
   */

  watch () {
    this.detect();
  }

  detect () {
    const files = readDir(this.opts.paths); // 读取目录文件列表

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

    this.emit('complete'); // 检测完成
  }
}
