/**
 * *****************************************************************************
 *
 * Error middleware
 *
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import ISODate from '../../utils/date.mjs';
const debug = util.debuglog('debug:middleware.error');

export default function (logPath) {
  if (null == logPath) throw new Error('You must provide a valid logPath.'); 

  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true}).catch(err => { debug(err); });

  return async function errorMiddleware (ctx, next) { 
    try { 
      await next();
    } catch (err) {  
			// Deal with caughted middleware-level exception
			
			// write log to error_log
      const log = err.message + ' ' + new Date().toString() + os.EOL; 
      const sn = ISODate.toLocaleISOString().substr(0, 10).replace(/[-\/]/g, '');
      const logFile = path.join(logPath, `error_log_${sn}`); 
      await fs.promises.open(logFile, 'a+')
				.then(fd => fd.appendFile(log).then(() => fd.close()));

			// set respond status
			ctx.status = err.status || 500;

			if (ctx.app.env === 'development') {
				ctx.body = `<pre>${err.stack}</pre>`;
			} else {
				ctx.body = err.message
			}
    } 
  }
}
