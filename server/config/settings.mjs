/**
 * *****************************************************************************
 *
 * Settings
 * ==============
 *
 * 系统配置: 
 *
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

import './env.mjs';
import paths from './paths.mjs';
import system from './system.mjs';

// settings from config
const sfc = fs.readFileSync(path.join(paths.APP_HOME, 'settings.json'), 'utf8');
const configs = JSON.parse(sfc);

export default new Proxy(Object.assign(configs, { paths: paths }, { system: system }), {
  get: function (target, property, receiver) {
    if (property === 'env') return process.env.NODE_ENV;
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

	set: function (target, property, value) {
    if (property === 'env') {
      process.env.NODE_ENV = value;
    }

		target[property] = value;
		return true;
	},
});

/**
 *
 *
 */

function deletePidFile () {
  const pidFile = path.join(paths.APP_HOME, `${process.title}.pid`);
  return fs.promises.unlink(pidFile);
}

/**
 *
 */

function writePidFile () {
  const pidFile = path.join(paths.APP_HOME, `${process.title}.pid`);
  return fs.promises.writeFile(pidFile, String(process.pid));
}

/**
 * read config file
 */

function readConfig () {
  fs.open(path.join(paths.APP_HOME, 'settings.json'), 'a+', (err, fd) => {
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

