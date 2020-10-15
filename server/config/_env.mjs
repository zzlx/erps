/**
 * *****************************************************************************
 *
 * process配置
 *
 * 配置项目的优先级: 
 *
 * * 系统默认项: ※ 系统默认配置或无配置 
 * * 文件配置项: ※※ dotenv文件配置项覆盖默认值
 * * 命令行配置: ※※※ 命令行配置具有最高优先级
 *
 * *****************************************************************************
 */

import assert from 'assert';
import fs from 'fs';
import util from 'util';
import { paths, appName } from './_paths.mjs';
import { envParser } from '../utils.lib.mjs';

const debug = util.debuglog('debug:env.mjs');

if (fs.existsSync(paths.ENV)) {
  const dotenvObj = envParser(fs.readFileSync(paths.ENV));
  assert(typeof dotenvObj === 'object', '解析.env文件出错');

  for (let env of Object.keys(dotenvObj)) {
    if (process.env[env] == null) process.env[env] = dotenvObj[env];
  }
}

process.env.NODE_ENV = process.env.NODE_ENV || 'production'; // 环境参数

process.on('exit', code => {
  const uptime = Math.ceil(process.uptime()*1000);
  const pid = process.pid;
  const title = process.title ? String(process.title).toUpperCase() : 'Process';
  debug(`${title}(PID:${pid}) is running ${uptime}ms before exit.`);
});

// 被捕获的exception\rejection,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.error('Caught Exception: %o', error);
  console.error('Origin Exception: %s', origin);
});

// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Caught Rejection: %o', reason);
});

