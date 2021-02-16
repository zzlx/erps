/**
 * *****************************************************************************
 *
 * 配置项管理器
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import paths from './paths.mjs';
import Package from './package.mjs';
import debuglog from '../debuglog.mjs';

const debug = debuglog('debug:configs.mjs');

// 系统预设配置项目
const defaults = {
  description: '系统配置',
  keys: null,
  passphrase: null,
  cert: '/etc/ssl/localhost-cert.pem',
  privateKey: '/etc/ssl/private.pem',
  initialSetup: true, // 首次配置
}

// 监测config目录
const configPath = path.join(process.env.HOME, '.config', Package.name);
fs.promises.mkdir(configPath).then(() => {
  // 创建配置目录
  defaults.initialSetup = true;

}).catch(error => {
  // 配置目录已存在
  if (error.code === 'EEXIST') {
    defaults.initialSetup = false;
  }
});

debug(defaults);

// 配置文件不存在时
if (paths.SETTINGS == null) {
  paths.SETTINGS = path.join(paths.ROOT, 'settings.json');
  await writeJsonFile(defaults);
} else {
  const json = JSON.parse(fs.readFileSync(paths.SETTINGS, 'utf8'));
  Object.assign(defaults, json);
}

export default new Proxy(defaults, {
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
  return fs.promises.writeFile(
    paths.SETTINGS, 
    JSON.stringify(obj, null, 2), 
    'utf8'
  );
}
