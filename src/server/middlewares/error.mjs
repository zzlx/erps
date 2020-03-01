/**
 * Error handler
 *
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import ISODate from '../../utils/date.mjs';
const debug = util.debuglog('debug:error');

export default function (logPath) {
  if (null == logPath) throw new Error('You must provide a valid logPath.'); 

  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true}).catch(err => { debug(err); });

  return async function errorHandlerMiddleware (ctx, next) { 
    try { 
      await next();
    } catch (err) { // 捕捉中间件级别的错误
      debug(err);
      //ctx.onerror(err); // 处理错误事件

      if ('development' === ctx.app.env) {
        // 开发模式下将错误信息输出到页面
        debug('Middleware error: ', err);
      }

      const log = err.message + ' ' + new Date().toString() + os.EOL; 

      const sn = ISODate.toLocaleISOString().substr(0, 10).replace(/[-\/]/g, '');
      const logFile = path.join(logPath, `${sn}_error.log`);
      fs.promises.open(logFile, 'a+').then(fd => {
        return fd.appendFile(log).then(() => fd.close());
      }).catch(err => debug(err));
    } 
  }
}
