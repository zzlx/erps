/**
 * *****************************************************************************
 *
 * Error middleware
 *
 * *****************************************************************************
 */

import fs from 'fs';
import http from 'http';
import os from 'os';
import path from 'path';
import util from 'util';

import ISODate from '../../utils/date.mjs';
import HttpError from '../kernel/http-errors.mjs';
const debug = util.debuglog('debug:middleware.error');

export default function (logPath) {
  if (null == logPath) throw new Error('You must provide a valid logPath.'); 
  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true}).catch(err => { debug(err); });

  return async function errorMiddleware (ctx, next) { 
    try { 
      await next();
    } catch (err) {  
      debug(new HttpError(err));
      let error = err instanceof HttpError ? err : new HttpError(err);

			// write log to error_log
      const log = error.message + ' ' + new Date().toString() + os.EOL; 
      const sn = ISODate.toLocaleISOString().substr(0, 10).replace(/[-\/]/g, '');
      const logFile = path.join(logPath, `error_log_${sn}`); 
      await fs.promises.open(logFile, 'a+')
				.then(fd => fd.appendFile(log).then(() => fd.close()));

      // 将捕获到的错误转发,并执行系统错误处理程序
      return Promise.reject(error);
    } 
  }
}
