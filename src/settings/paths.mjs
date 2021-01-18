/**
 * *****************************************************************************
 *
 * 目录配置管理器
 * Paths Configuration Manager
 * ===
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

const paths = Object.create(null);

(root => {
  // Set ROOT Path
  Object.defineProperty(paths, 'ROOT', {
    value: root,
    writable: false,
    enumerable: true,
    configurable: false,
  });

  // Read paths from source code, can not be writable、configurable、enumerable
  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name)
      .replace(/^(\.)/, 'DOT_')
      .replace(/(\..+)$/, '') // 去掉扩展名后缀
      .replace(/[\.|-]/g, '_')
      .toUpperCase(); 

    // 
    Object.defineProperty(paths, name, {
      value: path.join(root, file.name),
      writable: false,
      enumerable: false, 
      configurable: false,
    });
  });

  return paths;
})(path.dirname(path.dirname(path.dirname(import.meta.url.substr(7)))));

// 配置的目录路径
// 可配置、枚举,以便在配置文件保存配置
// 卸载程序执行时删除所有可枚举的目录
export default new Proxy(paths, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
    fs.promises.mkdir(value, {recursive: true}); // 创建配置目录

    return Object.defineProperty(target, property, {
      value: value,
      writable: true,
      enumerable: false,
      configurable: false,
    });
	}
});
