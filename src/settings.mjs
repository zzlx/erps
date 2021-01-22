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

import paths from './settings/paths.mjs';
import config from './settings/config.mjs';
import env from './settings/env.mjs';
import git from './settings/git.mjs';
import system from './settings/system.mjs';
import packageJSON from './settings/package.mjs';

export default new Proxy({ 
  config,
  env,
  git,
  paths,
  packageJSON,
  system,
}, {
  get: function (target, property, receiver) {
    if (property === 'writePidFile') return writePidFile;
    if (property === 'deletePidFile') return deletePidFile;
    if (property === 'cert') {
      const certFile = target.config.certFile || `/etc/ssl/${os.hostname()}-cert.pem`;
      return fs.readFileSync(certFile);
    }
    if (property === 'privateKey') {
      const keyFile = target.config.privateKey || `/etc/ssl/privkey.pem`;
      return fs.readFileSync(keyFile);
    }
    if (property === 'toString' || property === 'toJSON') {
      return () => JSON.stringify(target);
    }

    return Reflect.get(target, property, receiver);
  },
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
