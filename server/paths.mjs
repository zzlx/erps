/**
 * *****************************************************************************
 *
 * 系统目录配置
 * ============
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';

// 源码目录
const paths = (root => {
  const dirs = { ROOT: root };

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name).replace(/^(\.)|(\..+)$/, '').toUpperCase(); 
    dirs[name] = path.join(root, file.name);

  });

  return dirs;
})(path.dirname(path.dirname(import.meta.url.substr(7))));

// 从package中读项目名称
const appName = paths.PACKAGE
  ? JSON.parse(fs.readFileSync(paths.PACKAGE)).name
  : 'esp'; // ERP service platform

// 输出模块 
export default new Proxy(paths, {
  get: function (target, property, receiver) {
    const HOME = os.homedir();

    if (property === 'CONFIG') return path.join(HOME, '.' + appName);
    if (property === 'HOME') return HOME; 
    if (property === 'LOG') return path.join(HOME, '.' + appName, 'log');
    if (property === 'data') return path.join(HOME, 'data');

    return Reflect.get(target, property, receiver);
  }
});
