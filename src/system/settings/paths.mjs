/**
 * *****************************************************************************
 *
 * 目录配置管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const __file = import.meta.url.substr(7);
const __root = path.dirname(path.dirname(path.dirname(path.dirname(__file))));

const paths = (root => {
  const paths = Object.create(null);

  Object.defineProperty(paths, 'ROOT', {
    value: root,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  fs.readdirSync(root, { withFileTypes: true }).forEach(p => {
    const name = String(p.name)
      .replace(/^(\.)/, 'DOT_')
      .replace(/(\..+)$/, '')
      .replace(/[\.|-]/g, '_')
      .toUpperCase(); 

    Object.defineProperty(paths, name, { 
      value: path.join(root, p.name),
      writable: false,
      enumerable: false,
      configurable: false,
    });
  });

  return paths;
})(__root);

export default new Proxy(paths, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value, receiver) {

    if (/^PATH_/.test(property)) {
      // 创建配置的目录
      fs.promises.mkdir(value, { recursive: true }).catch(console.error); 
    }

    return Reflect.set(...arguments);
	}
});
