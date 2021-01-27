/**
 * *****************************************************************************
 *
 * 配置项管理器
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';

// 系统预设配置项目
const configs = {
  description: '系统配置',
  keys: null,
  passphrase: null,
  cert: '/etc/ssl/localhost-cert.pem',
  privateKey: '/etc/ssl/private.pem',
}

// 配置文件不存在时
if (paths.DOT_SETTINGS == null) {
  paths.DOT_SETTINGS = path.join(paths.ROOT, '.settings.json');
  await writeJsonFile(configs);
} else {
  const json = JSON.parse(fs.readFileSync(paths.DOT_SETTINGS, 'utf8'));
  Object.assign(configs, json);
}

export default new Proxy(configs, {
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

function writeJsonFile (obj) {
  assert(obj, 'The param obj must be set.');

  return fs.promises.writeFile(
    paths.DOT_SETTINGS, 
    JSON.stringify(obj, null, 2), 
    'utf8'
  );
}
