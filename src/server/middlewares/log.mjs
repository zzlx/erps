/**
 * *****************************************************************************
 *
 * 访问日志记录
 *
 * @param: {String} logPath
 * @param: {String} format
 *
 * @return: {Function} middleware function
 * *****************************************************************************
 */

import fs from 'fs';
import os from 'os';
import path from 'path';
import util from 'util';

import date from '../../utils/date.mjs'; // @todo: 
const debug = util.debuglog('debug:middleware_log');

export default function logMiddleware (logPath, format) {
	if (null == logPath) logPath = path.join(process.env.HOME, '.log');

	// 保证日志目录存在
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

    debug('Request log:', log);

		next();

    // 写入日志文件
    const logFile = path.join(logPath, `${date.format('yyyymmdd')}_access.log`);

    fs.promises.open(logFile, 'a+').then(fd => {
			// 写入后关闭fd
			return fs.promises.appendFile(fd, log + os.EOL).then(() => fd.close())
		});

  } 
}
