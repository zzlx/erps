/**
 * *****************************************************************************
 *
 * 目录配置
 * ============
 *
 *
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

// 读取APP源码目录
const paths = (root => {
  const dirs = { APP_ROOT: root };

  fs.readdirSync(root, {withFileTypes: true}).forEach(file => {
    const name = String(file.name).replace(/^(\.)|(\..+)$/, '').toUpperCase(); 
    dirs[name] = path.join(root, file.name);
  });

  return dirs;
})(path.dirname(path.dirname(path.dirname(import.meta.url.substr(7)))));

// 从package中读取项目名称
const packageJSON = JSON.parse(fs.readFileSync(paths.PACKAGE));
const appName = packageJSON.name;
const version = packageJSON.version;

paths['APP_HOME'] = path.join(HOME, '.' + appName);
paths['APP_LOG'] = path.join(paths.APP_HOME, 'log');
paths['APP_WEB'] = path.join(paths.APP_HOME, 'web');

// 

// 输出模块 
export default new Proxy(paths, {
  get: function (target, property, receiver) {
    if (property === 'APP_DATA') return path.join(HOME, 'data');

    return Reflect.get(target, property, receiver);
  }
});


