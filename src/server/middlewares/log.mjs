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
const debug = util.debuglog('debug:middleware.log');

export default function logMiddleware (logPath, format) {
	if (null == logPath) logPath = path.join(process.env.HOME, '.log');

	// 保证日志目录存在
  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true});

  return function logMiddleware (ctx, next) {
    const log = new Array(
			date.toLocaleISOString(),
      ctx.method, 
			ctx.href,
      ctx.socket.remoteAddress,
			'"' + ctx.headers['user-agent'] + '"', // 记录用户代理
      ctx.socket.remotePort,
		).join(' ');

		next();     // 执行下一中间件
		debug(log); // 打印调试信息

		const dateSN = date.format('yyyymmdd');
    // 写入日志文件
    fs.promises.open(path.join(logPath, `request_${dateSN}.log`), 'a+')
		.then(fd => {
			return fs.promises.appendFile(fd, log + os.EOL).then(() => fd.close())
		}).catch(err => console.log(err));

  } 
}
