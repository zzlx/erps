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
const __root = path.dirname(path.dirname(path.dirname(__file)));

// 源码目录及文件预定义, 此配置不可重写配置
const PATHS = {
  GIT: '.git',
  BIN: 'bin',
  DOCS: 'docs',
  PUBLIC: 'public',
  SERVER: 'server',
  SRC: 'src',
  GITIGNORE: '.gitignore',
  NPMRC: '.npmrc',
  VIMRC: '.vimrc',
  LICENSE: 'LICENSE',
  README: 'README.md',
  CONFIGURE: 'configure',
  MAKEFILE: 'makefile',
  PACKAGE: 'package.json',
};

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

// 配置的目录路径
// 可配置、枚举,以便在配置文件保存配置
// 卸载程序执行时删除所有可枚举的目录
export default new Proxy(paths, {
  get: function (target, property, receiver) {
    if (property === 'PATH_HOME') {
      return target.PATH_HOME || path.join(os.homedir(), '.erps');
    }
    if (property === 'PATH_LOG') return path.join(receiver.PATH_HOME, 'log');

    return Reflect.get(target, property, receiver);
  },
	set: function (target, property, value) {
    if (/^PATH_/.test(property)) {
      fs.promises.mkdir(value, {recursive: true}); // 创建配置目录
    }

    return Object.defineProperty(target, property, {
      value: value,
      writable: true,
      enumerable: false,
      configurable: false,
    });
	}
});
