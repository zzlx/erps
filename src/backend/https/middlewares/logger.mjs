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

import path from 'path';
import assert from 'assert';

export function logger (options = {}) {
  return async function logMiddleware (ctx, next) {
    ctx.state.log = {
      "atimeMs": Date.now(), //  access time in mill sec
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

    console.log(JSON.stringify(ctx.state.log));
  } 
}
