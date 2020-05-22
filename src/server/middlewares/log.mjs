/**
 * *****************************************************************************
 *
 * 访问日志记录
 *
 * @param: {String} logPath
 * @return: {Function} middleware function
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';
import date from '../../utils/date.mjs';
const debug = util.debuglog('debug:log_middleware');

export default function log (logPath) {
  if (null == logPath) throw new ERROR('You must provide a valid logPath.'); 

  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true});

  return function logMiddleware (ctx, next) {
    const log = ''
      + date.format('yy-mm-dd HH:MM:ss') 
      + ' ' 
      + ctx.method 
      + ' ' 
      + ctx.href
      + ' ' 
      + ctx.socket.remoteAddress 
      + ' ' 
      + ctx.socket.remotePort;

    debug('logMiddleware: log=', log);

    // 写入日志文件
    const logFile = path.join(logPath, `${date.format('yyyymmdd')}_access.log`);
    fs.promises.open(logFile, 'a+').then(fd => {
      return fd.appendFile(log + os.EOL).then(() => fd.close());
    }).catch(err => debug(err));

    // next如果放到代码块开始处，将导致后续中间件执行顺序错误
    return next();
  } 
}
