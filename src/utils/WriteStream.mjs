/**
 * *****************************************************************************
 *
 * 智能写入器
 *
 * 提供一个文件路径，持续的写入功能,空闲时关闭写入流,需要写入时自动重建写入流
 *
 * *****************************************************************************
 */

import fs from 'fs';
import { assert } from '../utils/index.mjs'

const WS = Symbol('write_stream');
const FP = Symbol('file_path');

export default class WriterStream {
  constructor (path) {
    this.cache = []; // 缓存器, 写入流未准备就绪时先缓存要写入的数据
  }


  set path (value) {
    assert(typeof value === 'string', `${value} must be a string.`)
    if (this[FP] === value) return this[FP];
    this[FP] = value;
    this[WS] = this.createWriteStream();
  }

  get stream () {
    if (this[WS] == null) {
      this[WS] = this.createWriteStream();
    }

    return this[WS];
  }

  write (str) {
    assert(typeof str === 'string', `${str} must be a string.`)
    this.cache.push(str);
    this.realWrite();
  }

  realWrite () {
    if (this.stream.writable) {
      const chunk = this.cache.shift();
      if (chunk == null) return;

      this.stream.write(chunk, () => {
        this.realWrite();
      });
    }
  }

  createWriteStream() {
    const stream = fs.createWriteStream(this[FP], {
      flags: 'a+'
    });
    stream.on('error', err => {
      this.stream = null;
    });

    return stream; 
  }
}
