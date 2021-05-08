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
import path from 'path';
import { appinfo } from './appinfo.mjs';
import { paths } from './paths.mjs';

const defaults = {
  description: '系统配置',
  keys: null,
  passphrase: null,
  cert: '/etc/ssl/localhost-cert.pem',
  privateKey: '/etc/ssl/private.pem',
}

const configFile = path.join(paths.CACHE, 'config.json');

if (fs.existsSync(configFile)) {
  const json = JSON.parse(fs.readFileSync(configFile, 'utf8'));
  Object.assign(defaults, json);
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
