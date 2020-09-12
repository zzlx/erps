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
    let timeout_1 = null;

    this.on('change', (file) => {
      if (timeout_1 !== null) clearTimeout(timeout_1); 
      timeout_1 = setTimeout(() => callback(), 2500); // 延迟2.5秒内的连续变动

    });

    setInterval(() => {
      this.detectOnce();
    }, 2500); // 每隔2.5秒检测一次变动
  }

  detectOnce () {
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
  }
}
