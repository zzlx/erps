/**
 * *****************************************************************************
 *
 * env配置管理器
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';
import envParser from '../utils/envParser.mjs';

const dotenvObj = paths.DOT_ENV
  ?  envParser(fs.readFileSync(paths.DOT_ENV))
  : {};
assert(typeof dotenvObj === 'object', '解析.env文件出错');

for (let env of Object.keys(dotenvObj)) {
  if (process.env[env] == null) process.env[env] = dotenvObj[env];
}

export default new Proxy(dotenvObj, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, receiver) {
  }
});
