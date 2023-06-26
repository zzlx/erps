/**
 * *****************************************************************************
 *
 * 目录监控器
 *
 * 监测目录文件改动,当文件发生变动时，触发change事件
 *
 * *****************************************************************************
 */

import crypto from "crypto";
import EventEmitter from "events";
import fs from 'fs';

import { readDir } from './readDir.mjs';

export class PathWatcher extends EventEmitter {
  constructor (props) {
    super();
    this.paths = props;
    this.cache = new Map(); // 内存存储
    this.watchmode = false;

    this.on("complete", () => {
      //debug("完成一次目录变动检测");
      setTimeout(() => {
        this.detect();
      }, 800);
    });

    this.detect();
  }

  /**
   * have a detect
   */

  detect () {
    for (const file of readDir(this.paths)) {
      try {
        const content = fs.readFileSync(file, "utf8");
        const sha1 = crypto.createHash("sha1").update(content).digest("hex");

        if (this.cache.has(file) && this.cache.get(file) !== sha1) {
          this.emit("change", file);
          this.cache.set(file, sha1); // 存储改动后的哈希值
          break;
        }

        this.cache.set(file, sha1); // 存储文件哈希值
      } catch (error) {
        // debug("读取文件出错", error);
        // 读取文件出错时，时触发change事件
        // 如果文件被删除，删除file健
        this.cache.delete(file);
        this.emit("change", file);
        break;
      }


    }

    this.emit("complete"); // 通知检测完成事件
  }
}
