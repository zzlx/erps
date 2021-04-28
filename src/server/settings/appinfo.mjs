/**
 * *****************************************************************************
 *
 * pacage.json配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import { paths } from './paths.mjs';

const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE));

export const appinfo = new Proxy(packageJSON, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    if (target[property] === undefined) return false;
    if (property === 'dependencies') {
    }

    target[property] = value;
    // 写入packageJSON
    fs.promises.writeFile(paths.PACKAGE, JSON.stringify(target, null, 2));
    return true;
  }
});


