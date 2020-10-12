/**
 * *****************************************************************************
 *
 * # 日志记录
 *
 * 构造日志对象,为服务器提供日志记录
 *
 * @param {function} callback 将日志对象交给callback处理
 * @return {function} middleware
 * @api public
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import { date } from '../../utils.lib.mjs';

const debug = util.debuglog('debug:logger.mjs');

const fmt = v => `0${v}`.substr(-2);
const sn = d => `${d.getFullYear()}${fmt(d.getMonth() + 1)}${fmt(d.getDate())}`; 

export default function logger (options = {}) {
  const opts = Object.assign({}, {
    path: process.cwd(),
  }, typeof options === 'string' ? {path: options} : options);

  const logFile = path.join(opts.path, 'request.log');

  let ws = fs.createWriteStream(logFile, {flags: 'a', autoClose: false}); 

  return async function logMiddleware (ctx, next) {
    // 记录访问日志
    ctx.state.log = {
      "datetime": date.toISOString(),
      "c-address": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "user-agent": ctx.get("user-agent"),
      "method": ctx.method,
      "href": ctx.href,
      "status": null,
      "referer": ctx.get("referer"),
      "s-address": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
    };

    try {
      await next(); // 执行中间件栈
    } catch (error) {
      Promise.reject(error);
    }

    if (ctx.state.noLog) return;

    ctx.state.log['status'] = ctx.status; // 记录服务端响应信息

    // 存档日志
    await archiveFile(logFile); 

    if (!ws.closed) ws.write('\n' + Object.values(ctx.state.log).join('\t'));

    async function archiveFile (file) {

      if (!fs.existsSync(file)) {
        if (!ws.closed) ws.write(Object.keys(ctx.state.log).join('\t'));
      }
      const fileSN = sn(new Date(fs.lstatSync(file).birthtime));
      const nowSN = sn(new Date());
      if (fileSN === nowSN) return false;

      await fs.promises.copyFile(file, fileSN + "_" + file)
        .then(() => fs.promises.unlink(file))
        .then(() => {
          if (!ws.closed) ws.write(Object.keys(ctx.state.log).join('\t'));
        });

      return true;
    } 
  } 
}
