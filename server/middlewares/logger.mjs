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

import path from "path";
import util from 'util';

export function logger (format) {
  return async function loggerMiddleware (ctx, next) {
    const log = {
      "atimeMs": Date.now(), //  access time in mill sec
      "c-address": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "user-agent": ctx.get("user-agent"),
      "method": ctx.method,
      "href": ctx.href,
      "referer": ctx.get("referer"),
      "status": null, // status 在response阶段被设置
      "s-address": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
    };

    await next(); // 执行中间件栈

    // set responsed status
    log["status"] = ctx.status;

    // print request log in production environment
    // @todo: 增加格式化输出
    ctx.app.env !== 'development' && console.log(JSON.stringify(log));
  }
}
