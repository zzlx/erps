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

import fs from 'fs';
import os from 'os';
import path from 'path';

// 读入源码目录
const paths = (root => {
  const dirs = { 
    APP_ROOT: root 
  };

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
    if (property === 'APP_HOME') {
      const configPath = path.join(os.homedir(), '.' + appName);
      if (!fs.existsSync(configPath)) fs.mkdirSync(configPath);
      return configPath; 
    }

    if (property === 'APP_LOG') {
      const logPath = path.join(os.homedir(), '.' + appName, 'log');
      if (!fs.existsSync(logPath)) fs.mkdirSync(logPath, { recursive: true });
      return logPath;
    }

    if (property === 'APP_DATA') return path.join(os.homedir(), 'data');

    return Reflect.get(target, property, receiver);
  }
});
