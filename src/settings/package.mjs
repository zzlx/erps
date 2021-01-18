/**
 * *****************************************************************************
 *
 * pacage.json配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import paths from './paths.mjs';

const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE));

export default new Proxy(packageJSON, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, receiver) {
  }
});
