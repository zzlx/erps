/**
 * *****************************************************************************
 *
 * 系统环境配置
 *
 *
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import util from 'util';
import paths from './paths.mjs';
import { envParser } from '../../src/utils.lib.mjs';

const debug = util.debuglog('debug:env.mjs');

// 如果
if (fs.existsSync(paths.ENV)) {
  const envObj = envParser(fs.readFileSync(paths.ENV));
  if (typeof envObj === 'object') {
    for (let env of Object.keys(envObj)) {
      //if (process.env[env] === null) 
      process.env[env] = envObj[env];
    }
  }
}

// 默认环境为production
process.env.NODE_ENV = process.env.NODE_ENV || 'production';

process.on('exit', code => {
  debug(`${process.title}(PID:${process.pid}) is exit with code ${code}.`);
});


// 被此事件捕获的exception,需要进行妥善处理
// 不应出现未经管理的exception
process.on('uncaughtException', (error, origin) => {
  console.error('Caught exception: %o', error);
  console.error('Origin exception: %s', origin);
});

// 被此事件捕获的rejection,需要进行妥善处理
// 系统不应出现未经管理的rejection
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled rejection: %o', reason);
});
