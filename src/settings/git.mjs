/**
 * *****************************************************************************
 *
 * git配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';

const HEAD = String(fs.readFileSync(path.join(paths.DOT_GIT, 'head'))).split(':')[1].trim();
const branch = path.basename(HEAD);
const hash = String(fs.readFileSync(path.join(paths.DOT_GIT, HEAD))).trim();

export default new Proxy({
  branch,
  hash,
}, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, receiver) {
  }
});
