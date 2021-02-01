/**
 * *****************************************************************************
 *
 * System Preferences
 * ==============
 *
 * 用于管理系统配置
 *
 * 系统配置: 
 *
 * * 系统环境配置
 * * 服务端默认配置
 * * 服务端本地配置:config.json
 * * 数据库配置
 * * 用户本地配置
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import paths from './paths.mjs';
import env from './env.mjs';
import git from './git.mjs';
import packageJSON from './package.mjs';
import system from './system.mjs';
import configs from './configs.mjs';

export default new Proxy({ 
  name: packageJSON.name,
  version: packageJSON.version, 
  license: packageJSON.license || 'MIT',
  paths,
  system,
  port: process.env.PORT || '8888',
  host: isSupportIPv6() ? '::' : '0.0.0.0',
}, {
  get: function (target, property, receiver) {
    if (property === 'writePidFile') return writePidFile;
    if (property === 'deletePidFile') return deletePidFile;
    if (property === 'cert') return fs.readFileSync(configs.cert);
    if (property === 'privateKey') return fs.readFileSync(configs.privateKey);
    if (property === 'passphrase') return configs.passphrase;

    return Reflect.get(target, property, receiver);
  },
  set: function (target, property, value) {
  }
});

/**
 *
 *
 */

function deletePidFile () {
  const pidFile = path.join(paths.HOME_PATH, `${process.title}.pid`);
  return fs.promises.unlink(pidFile);
}

/**
 *
 */

function writePidFile () {
  const pidFile = path.join(paths.HOME_PATH, `${process.title}.pid`);
  return fs.promises.writeFile(pidFile, String(process.pid));
}

/**
 * read config file
 */

function readConfig () {
  fs.open(path.join(paths.HOME_PATH, 'settings.json'), 'a+', (err, fd) => {
    if (err) throw err;
    
    fs.read(fd, (err, bytesRead, buffer) => {
      if (err) throw err;
      const configJSON = buffer.toString('utf8');
      try {
        //this.config = JSON.parse(configJSON);
      } catch (err) {
        throw err;
      }
    });

    // close file
    fs.close(fd, (err) => {
      if (err) throw err;
    });
  });
}

/**
 * 判断系统是否支持IPv6
 */

function isSupportIPv6 () {
  let hasIPv6 = false;

  for (const networkInterface of Object.values(os.networkInterfaces())) {
    for (const network of networkInterface) {
      if (network.family === 'IPv6') { hasIPv6 = true; break; }
    }

    if (hasIPv6) break;
  }

  return hasIPv6;
}

function detectPort (port) {
  const message =
    process.platform !== 'win32' && defaultPort < 1024 && !isRoot()
      ? `Admin permissions are required to run a server on a port below 1024.`
      : `Something is already running on port ${defaultPort}.`;

}
