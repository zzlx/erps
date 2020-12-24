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

import assert from 'assert';
import { date } from '../../../src/utils.lib.mjs';
import logWriter from '../logWriter.mjs';

export default function logger (options = {}) {
  const opts = Object.assign({
  }, typeof options === 'string' ? { logFile: options } : options);

  assert(opts.logFile, 'opts.logFile must be setting.');

  return async function logMiddleware (ctx, next) {
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

    await next(); // 执行中间件栈

    ctx.state.log['status'] = ctx.status;

    if (ctx.state.noLog) return; // 记录request log

    logWriter(opts.logFile, ctx.state.log);
  } 
}
