/**
 * *****************************************************************************
 *
 * Configuration
 * ==============
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

import './config/env.mjs';
import paths, { appName, appVersion } from './config/paths.mjs';
import system from './config/system.mjs';
import templates from './config/templates.mjs';

// settings from config
const sfc = fs.readFileSync(paths.SETTINGS_JSON, 'utf8');
const configs = JSON.parse(sfc);
mkdirs(paths);

export default new Proxy(Object.assign({}, configs, { 
  paths,
  system,
  appName,
  appVersion,
  templates,
}), {
  get: function (target, property, receiver) {
    if (property === 'isDevel') return process.env.NODE_ENV === 'development';
    if (property === 'getGitInfo') return getGitInfo;
    if (property === 'writePidFile') return writePidFile;
    if (property === 'deletePidFile') return deletePidFile;
    if (property === 'saveConfig') return () => {};
    if (property === 'readConfig') return () => {};
    if (property === 'cert') {
      const certFile = target.certFile || `/etc/ssl/${os.hostname()}-cert.pem`;
      return fs.readFileSync(certFile);
    }
    if (property === 'privateKey') {
      const keyFile = target.privateKey || `/etc/ssl/privkey.pem`;
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

function getGitInfo () {
  const HEAD = String(fs.readFileSync(path.join(paths.GIT, 'head'))).split(':')[1].trim();
  const branch = path.basename(HEAD);
  const hash = String(fs.readFileSync(path.join(paths.GIT, HEAD))).trim();

  return {
    branch: branch, 
    commit: hash,
  };
}

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
 * 创建目录
 *
 * @param {object} pathsObj
 * @param {object} options
 */

export function mkdirs (pathsObj) {
  for (let p of Object.values(pathsObj)) {
    if (!fs.existsSync(p)) {
      if (/PATH$/.test(p)) fs.promises.mkdir(p, { recursive: true });
      if (/FILE$/.test(p)) fs.promises.writeFile(p, '');
    }
  }
}
