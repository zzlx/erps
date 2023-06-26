/**
 * *****************************************************************************
 *
 * 配置项容器
 *
 * 
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import { appinfo } from './appinfo.mjs';
import { paths } from './paths.mjs';

paths.CONFIG = path.join(os.homedir(), '.config', appinfo.name);
const configFile = path.join(paths.CONFIG, 'config.json');

const defaults = {
  description: '系统配置',
  keys: null,
  passphrase: Math.random().toString(16).substr(2,8),
  cert: path.join(paths.CONFIG, 'ssl', 'localhost-cert.pem'),
  privateKey: path.join(paths.CONFIG, 'ssl', 'localhost-key.pem')
}

if (fs.existsSync(configFile)) {
  const json = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  Object.assign(defaults, json);
} else {
  fs.writeFileSync(configFile, JSON.stringify(defaults));
}

export const configs = new Proxy(defaults, {
  get: function (target, property, receiver) {
    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
    target[property] = value; // 重置配置
    writeJsonFile(target); // 将更新写入配置文件
    return true;
  }
});

/**
 * 写入配置文件
 */

function writeJsonFile (file, obj) {
  return fs.promises.writeFile(file, JSON.stringify(obj, null, 2), 'utf8');
}
