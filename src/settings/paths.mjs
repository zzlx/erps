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
const paths = (root => {
  const paths = Object.create(null);

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name)
      .replace(/^(\.)/, '')   // 去掉dot前缀
      .replace(/(\..+)$/, '') // 去掉扩展名后缀
      .replace(/-/g, '_')     // 统一分隔符
      .toUpperCase(); 

    Object.defineProperty(paths, name, {
      value: path.join(root, file.name),
      writable: false,
      enumerable: false, 
      configurable: false,
    });
  });

  return paths;
})(path.dirname(path.dirname(path.dirname(import.meta.url.substr(7)))));

// read configurations from package.json
export const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE));
export const appName = packageJSON.name;
export const appVersion = packageJSON.version;

// 配置的目录路径
// 可配置、枚举,以便在配置文件保存配置
paths.HOME_PATH = path.join(os.homedir(), `.${appName}`);
paths.CACHE_PATH = path.join(paths.HOME_PATH, 'cache');
paths.DATA_PATH = path.join(paths.HOME_PATH, 'data');
paths.LOG_PATH = path.join(paths.HOME_PATH, 'log');
paths.WWW_PATH = path.join(paths.HOME_PATH, 'www');
paths.TEST_FILE = path.join(paths.HOME_PATH, 'test.md');

export default new Proxy(paths, {
  get: function (target, property, receiver) {
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
