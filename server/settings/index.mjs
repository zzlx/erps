/**
 * *****************************************************************************
 *
 * System Preferences
 * ==============
 *
 * 用于管理系统配置
 *
 * 配置项目优先级: 启动参数 > .env > 系统配置文件 > 默认配置
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

import env from './env.mjs';
import paths from './paths.mjs';
import git from './git.mjs';
import packageJSON from './package.mjs';
import system from './system.mjs';
import configs from './configs.mjs';

// 配置目录
paths.PATH_CACHE = path.join(process.env.HOME, '.cache');
paths.PATH_DATA = path.join(paths.PATH_CACHE, 'data');
paths.PATH_LOG = path.join(paths.PATH_CACHE, 'log');

export default new Proxy({ 
  name: packageJSON.name,
  version: packageJSON.version || '1.0.0', 
  license: packageJSON.license || 'MIT',
  paths,
  system,
  host: isSupportIPv6() ? '::' : '0.0.0.0',
  port: process.env.PORT || configs.port,
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

/**
 *
 * Argv Parser
 *
 * parser arguments and value, return param map.
 *
 * @params {array|string} argvs
 * @return {object} state
 * @api public
 */

function argvParser (argvs = Array.prototype.slice.call(process.argv, 2)) {
  if ('string' === typeof argvs) argvs = argvStr.split(/\s+/);
  const params = Object.create(null);
	const it = argvs[Symbol.iterator]();

	let argv = null;
	let i = -1;

	while ((argv = it.next().value) != null) {
		i++; 
    // @todo: 是否有必要改正则匹配逻辑为字串匹配? 对性能影响极小,暂时不作修改.
    const matcher = argv => /^(?:--(\w+)(?:=(.+))?)|(?:-(\w+))|(.+)/g.exec(argv);

		const match = matcher(argv);
		if (null == match) continue; // bypass if no match

    const key = match[1];
    const value = match[2];
		const commands = match[3];
    const command = match[4];
		
    if (key) {
      params[key] = value == null ? true : value;
      
      if (params[key] === true && argvs[i+1] && null == matcher(argvs[i+1])) {
        params[key] = argvs[i+1];
      }
    }

		if (commands) {
      // 单参数情况时, eg. -o /home/test.txt
			if (commands.length === 1 && argvs[i+1] && null == matcher(argvs[i+1])) {
				params[commands] = argvs[i+1];
			} else {
        for (let v of commands ) params[v] = true; // multi params, eg. -abc
      }
		}

    if (command) params[command] = true;
  }

  return params;
}
