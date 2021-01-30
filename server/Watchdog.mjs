/**
 * *****************************************************************************
 *
 * 源码文件监视器
 * 
 * 当源码文件发生修改时,触发change事件，需要给实例绑定change事件处理程序
 * 
 * *****************************************************************************
 */

import assert from 'assert';
import crypto from 'crypto';
import EventEmitter from 'events'; 
import fs from 'fs';
import path from 'path';

export default class Watchdog extends EventEmitter {
  constructor() {
    super();

    this.watchPaths = Array.prototype.slice.call(arguments);
    this.interval = 800;
    this.cache = new Map(); // 存储器

    this.on('complete', () => {
      this.timeout = setTimeout(() => {
        this.detect();
      }, this.inverval);
    });

    this.detect();
  }

  detect () {

    for (const file of readDir(this.watchPaths)) {
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

    this.emit('complete'); // 通知检测完成事件
  }
}


/**
 * 循环读取目录,返回文件路径列表
 *
 */

export function readDir (dir) {
  let files = []; // 文件列表
  
  if (Array.isArray(dir)) {
    for (let d of dir) files.push(...readDir(d));
  }

  if (typeof dir === 'string' && fs.existsSync(dir)) {
    for (const file of fs.readdirSync(dir, { withFileTypes: true })) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) files.push(filePath);
      if (file.isDirectory()) files = files.concat(readDir(filePath));
    }
  }

  return files;
}
