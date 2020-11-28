/**
 * *****************************************************************************
 *
 * 目录配置
 * ============
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import os from 'os';
import path from 'path';

// 获取系统目录配置
const HOME = os.homedir();
const TMP_DIR = os.tmpdir();

// APP源码目录路径
const appPaths = (root => {
  const dirs = Object.create(null);

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name)
      .replace(/^(\.)/, '')       // 去掉dot前缀
      .replace(/(\..+)$/, '')     // 去掉dot扩展名后缀
      .replace('-', '_')
      .toUpperCase(); 

    Object.defineProperty(dirs, name, {
      value: path.join(root, file.name),
      writable: false,   // 不可被重写
      enumerable: false, // 配置为不可被枚举的目录路径
      configurable: false,
    });
  });

  return dirs;
})(path.dirname(path.dirname(path.dirname(import.meta.url.substr(7)))));

const paths = new Proxy(appPaths, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
    return Object.defineProperty(target, property, {
      value: value,
      writable: true,
      enumerable: true,
      configurable: true,
    });
	},
});

// 从package.json中读取项目名称
export const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE));
export const appName = packageJSON.name;
export const appVersion = packageJSON.version;

// 配置的目录路径
paths.HOME_PATH = path.join(HOME, `.${appName}`);
paths.DATA_PATH = path.join(paths.HOME_PATH, 'data');
paths.LOG_PATH  = path.join(paths.HOME_PATH, 'log');
paths.WWW_PATH  = path.join(paths.HOME_PATH, 'www');

export default paths;
