/**
 * *****************************************************************************
 *
 * git配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import { paths } from './paths.mjs';

export const gitinfo = new Proxy({}, {
  get: function (target, property, receiver) {
    if (property === 'HEAD') {
      return String(fs.readFileSync(path.join(paths.DOT_GIT, 'head'))).split(':')[1].trim();
    }

    if (property === 'branch') {
      return path.basename(receiver.HEAD);
    }

    if (property === 'hash') {
      return String(fs.readFileSync(path.join(paths.DOT_GIT, HEAD))).trim();
    }

    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
  }
});
