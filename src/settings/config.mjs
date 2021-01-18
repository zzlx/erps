/**
 * *****************************************************************************
 *
 * config.json配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';

const configJSON = JSON.parse(fs.readFileSync(paths.DOT_CONFIG, 'utf8'));

export default new Proxy(configJSON, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
});
