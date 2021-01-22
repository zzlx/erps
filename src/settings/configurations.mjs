/**
 * *****************************************************************************
 *
 * 配置项管理器
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';

const configJSON = JSON.parse(fs.readFileSync(paths.DOT_CONFIG, 'utf8'));
const configurations = Object.assign({
  keys: null,
  passphrase: null,
}, configJSON);

export default new Proxy(configurations, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
});
