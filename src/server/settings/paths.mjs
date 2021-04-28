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

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const __root = path.dirname(path.dirname(path.dirname(__dirname)));

export const paths = new Proxy(getPaths(__root), {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value, receiver) {
    // 创建配置的目录
    if (/_D$/.test(property)) fs.mkdirSync(value, { recursive: true }); 
    return Reflect.set(...arguments);
	}
});

function getPaths (root) {
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
}
