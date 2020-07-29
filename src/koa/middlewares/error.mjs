/**
 * *****************************************************************************
 *
 * Error middleware
 *
 * app-level errors
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import util from 'util';

import ISODate from '../../utils/Date.mjs';
const debug = util.debuglog('debug:middleware.error');

export default function () {
  const logPath = path.join(os.homedir(), '.erps', 'log');
  if (null == logPath) throw new Error('You must provide a valid logPath.'); 

  return async function errorMiddleware (ctx, next) { 
    try { 
      await next();
    } catch (error) {  
			// write log to error_log
      const log = error.message + ' ' + new Date().toString() + os.EOL; 
      const sn = ISODate.prototype.toLocaleISOString().substr(0, 10).replace(/[-\/]/g, '');
      const logFile = path.join(logPath, `error_log_${sn}`); 
      await fs.promises.open(logFile, 'a+')
				.then(fd => fd.appendFile(log).then(() => fd.close()));

      // 将捕获到的错误转发,并执行系统错误处理程序
      //
      return Promise.reject(error);
    } 
  }
}

