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

	// 保证日志目录
	if (null == logPath) logPath = path.join(process.env.HOME, '.log');
  // if logPath already exists, that can be no side effect
  fs.promises.mkdir(logPath, {recursive: true}).catch(err => {
		debug('创建日志目录时发生错误:');
	});

  // format: 
  // {time}
  // {method}
  // {ip}
  // {port}
  // {user-agent}
  // {referer}
  // {status}

  return function logMiddleware (ctx, next) {

    const log = new Array(
			date.toLocaleISOString(),
      ctx.method, 
			ctx.href,
			'"' + ctx.headers['user-agent'] + '"', // 记录用户代理
      ctx.socket.remoteAddress + ':' + ctx.socket.remotePort,
		).join(' ');

    // 写入request日志后再执行后续中间件
		const dateSN = date.format('yyyymmdd');
    return fs.promises.open(path.join(logPath, `request_${dateSN}.log`), 'a+')
			.then(fd => fs.promises.appendFile(fd, log + os.EOL).then(() => fd.close()))
			.then(() => next())
  } 
}
