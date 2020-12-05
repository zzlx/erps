/**
 * *****************************************************************************
 *
 * 模板文件: 用于生成动态内容
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';

import paths from './paths.mjs';
import { camelCase } from '../src/utils.lib.mjs';

const templates = (root => {
  const obj = Object.create(null);

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    obj[camelCase(file.name)] = path.join(root, file.name);
  });

  return obj;
})(path.join(paths.SRC, 'templates'));

export default new Proxy(templates, {
  get: function (target, property, receiver) {
    if (target[property]) return fs.readFileSync(target[property]);
    return Reflect.get(target, property, receiver);
  },
});
