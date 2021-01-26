/**
 * *****************************************************************************
 *
 * 配置项管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';

const configJSON = JSON.parse(fs.readFileSync(paths.DOT_SETTINGS, 'utf8'));
const settings = Object.assign({
  keys: null,
  passphrase: null,
}, configJSON);

export default new Proxy(settings, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    return true;
  }
});
