/**
 * *****************************************************************************
 *
 * Default Configurations
 * =======================
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
import { assert } from '../server/utils.mjs';

const __filename = import.meta.url.substr(7);
const __dirname = path.dirname(__filename);
const __basename = path.basename(__filename);
const debug = util.debuglog(`debug:${__basename}`);

const APP_ROOT = path.dirname(__dirname);
const PackageJSON = JSON.parse(fs.readFileSync(path.join(APP_ROOT, 'package.json'), 'utf8'));
const APP_HOME = path.join(os.homedir(), `.${PackageJSON.name}`);

// default configuration
const defaultConfiguration = {
  pidPrefix: 'org.zzlx',
  paths: {
    appRoot: APP_ROOT,
    appHome: APP_HOME, 
    configFile: path.join(APP_HOME, 'config.json'),
    dataPath: path.join(os.homedir(), 'data'),
    logPath: path.join(APP_HOME, 'log'),
    mainApp: path.join(APP_ROOT, 'server', 'main.mjs'),
    nodeModules: path.join(APP_ROOT, 'node_modules'),
    public: path.join(APP_ROOT, 'public'),
    serverPath: path.join(APP_ROOT, 'server'),
    scssEntryPoint: path.join(APP_ROOT, 'styles', 'main.scss'),
    stylesCss: path.join(APP_ROOT, 'public', 'statics', 'styles.css'),
  },
  server: {
    host: isSupportIPv6() ? "::" : "0.0.0.0",
    hostname: os.hostname(),
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 8888,
  }
}

/**
 * Utility functions
 */

function isSupportIPv6 () {
  const interfaces = os.networkInterfaces();
  const hasIPv6 = false;

  for (let item of Object.keys(interfaces)) {
    for (let ip of Object.keys(interfaces[item])) {
      if (ip.family === 'IPv6') {
        hasIPv6 = true;
        break;
      }

      if (hasIPv6) break;
    }
  }
  
  return hasIPv6;
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

/**
 * Configuration Object
 */

export default new Proxy(defaultConfiguration, {
  get: function (target, property, receiver) {
    if (property === 'env') return process.env.NODE_ENV || 'production';
    if (property === 'saveConfig') return () => {}
    if (property === 'readConfig') return () => {}
    if (property === 'readyPaths') return readyPaths;
    if (property === 'toString' || property === 'toJSON') {
      return () => JSON.stringify(target);
    }

    return Reflect.get(target, property, receiver);
  },

	set: function (target, property, value) {
    if (property === 'env') process.env.NODE_ENV = property

		target[property] = value;
		return true;
	},
});
