/**
 * *****************************************************************************
 *
 * Configurations
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

import { assert } from '../utils/index.mjs';
import paths from './paths.mjs';
import system from './system.mjs';

export default new Proxy({}, {
  get: function (target, property, receiver) {
    if (property === 'paths') return paths;
    if (property === 'system') return system;
    if (property === 'env') return process.env.NODE_ENV;
    if (property === 'writePidFile') return writePidFile;
    if (property === 'deletePidFile') return deletePidFile;
    if (property === 'saveConfig') return () => {};
    if (property === 'readConfig') return () => {};
    if (property === 'readyPaths') return readyPaths;
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
  const pidFile = path.join(paths.HOME, `${process.title}.pid`);
  return fs.promises.unlink(pidFile);
}

/**
 *
 */

function writePidFile () {
  const pidFile = path.join(paths.HOME, `${process.title}.pid`);
  return fs.promises.writeFile(pidFile, String(process.pid));
}

/**
 * read config file
 */

function readConfig () {
  fs.open(defaultConfiguration.paths.configJsonFile, 'a+', (err, fd) => {
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
 * ready paths
 *
 * @param {string} paths
 * @api public
 */

function readyPaths () {
  let paths = Array.prototype.slice.call(arguments);
  const promises = [];

  for (let path of paths) {
    assert(typeof path === 'string', 'paths must be string.');

    promises.push(
      fs.mkdir(path, { recursive: true }, err => {
        if (err) throw err;
      })
    );
  }

  return Promise.all(promises);
}
