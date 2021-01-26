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

/**
 * 读取配置
 */

const configJSON = JSON.parse(fs.readFileSync(paths.DOT_SETTINGS, 'utf8'));


export default new Proxy({ 
  git,
  paths,
  packageJSON,
  system,
}, {
  get: function (target, property, receiver) {
    if (property === 'name') return target.packageJSON.name;
    if (property === 'version') return target.packageJSON.version;
    if (property === 'license') return target.packageJSON.license;

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
