/**
 * *****************************************************************************
 *
 * Paths configurations
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

// read paths from source code, can not be writable、configurable、enumerable
const _ROOT = path.dirname(path.dirname(path.dirname(import.meta.url.substr(7))));
const paths = (root => {
  const paths = Object.create(null);

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name)
      .replace(/^(\.)/, '')
      .replace(/[\.|-]/g, '_')
      //.replace(/(\..+)$/, '') // 去掉扩展名后缀
      .toUpperCase(); 

    Object.defineProperty(paths, name, {
      value: path.join(root, file.name),
      writable: false,
      enumerable: false, 
      configurable: false,
    });
  });

  return paths;
})(_ROOT);

// read configurations from package.json
export const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE_JSON));
export const appName = packageJSON.name;
export const appVersion = packageJSON.version;

if (paths.HOME_PATH == null) paths.HOME_PATH = path.join(os.homedir(), '.' + appName);

// 配置的目录路径
// 可配置、枚举,以便在配置文件保存配置
export default new Proxy(paths, {
  get: function (target, property, receiver) {
    if (property === 'CACHE_PATH') return path.join(target.HOME_PATH, 'cache');
    if (property === 'DATA_PATH') return path.join(target.HOME_PATH, 'data');
    if (property === 'LOG_PATH') return path.join(target.HOME_PATH, 'log');

    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
    return Object.defineProperty(target, property, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: false,
    });
	},
});
