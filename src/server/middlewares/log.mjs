/**
 * 访问日志记录
 *
 * @param: {String} logPath
 * @return: {Function} middleware function
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import ISODate from '../../utils/date.mjs';
const debug = util.debuglog('debug:log');

export default function accessLog (logPath) {

  if (null == logPath) {
    logPath = path.join(process.env.HOME, '.log');
  }

  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true}).catch(err => {
    debug(err);
  });

  return function logMiddleware (ctx, next) {
    const log = ''
      + ISODate.toLocaleISOString() + ' '
      + ctx.method + ' ' + ctx.href
      + ' from '
      + ctx.socket.remoteAddress + ':' + ctx.socket.remotePort;

    debug(log);

    // 写入日志文件
    const sn = ISODate.toLocaleISOString().substr(0,10).replace(/[-\/]/g, '');
    const logFile = path.join(logPath, `${sn}_access.log`);
    fs.promises.open(logFile, 'a+').then(fd => {
      return fd.appendFile(log + os.EOL).then(() => fd.close());
    }).catch(err => debug(err));

    // next如果放到代码块开始处，将导致后续中间件执行顺序错误
    return next();
  } 
}
