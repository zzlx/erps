/**
 * *****************************************************************************
 *
 * Chenge
 * 
 * 观察目录变动后执行callback任务
 * 
 * *****************************************************************************
 */ 

import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';
import readDir from './readDir.mjs';

export default class FileWatcher extends EventEmitter {
  constructor() {
    super();
    let callback = () => {};
    this.paths = Array.prototype.slice.call(arguments);

    if (typeof(this.paths[this.paths.length - 1]) === 'function') {
      callback = this.paths.pop();
    }

    this.db = new Map();

    callback(); // 先执行一次

    this.on('change', (file) => {
      if (this.timeout && this.timeout._destroyed == null) {
        clearTimeout(this.timeout); 
      }

      this.timeout = setTimeout(() => callback(), 2500); // 2.5秒内再次出现变动则取消上次
    });

    this.detectChange(); // 执行检测
  }

  detectChange () {
    const files = readDir(this.paths);

    for (let file of files) {
      if (!fs.existsSync(file)) return;

      const content = fs.readFileSync(file, 'utf8');
      const sha1 = crypto.createHash('sha1').update(content).digest('hex');

      if (this.db.has(file) && this.db.get(file) !== sha1) {
        this.db.set(file, sha1);
        this.emit('change', file);
        break;
      }

      this.db.set(file, sha1);
    }

    setTimeout(() => this.detectChange(), 2500); // 间隔2秒,执行检测
  }
}
