/**
 * *****************************************************************************
 *
 * # 日志中间件
 *
 * 构造日志对象,为服务器提供日志记录
 *
 * @param {function} callback 将日志对象交给callback处理
 * @return {function} middleware
 * @api public
 *
 * *****************************************************************************
 */

import { assert, date } from '../../utils.mjs';

export default callback => {
  assert(typeof callback === 'function', `${callback} must be a function.`);

  return async function logMiddleware (ctx, next) {

    await next();

    callback({
      "datetime": date.toLocaleISOString(),
      "user-agent": ctx.get("user-agent"),
      "c-ip": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "method": ctx.method,
      "url": ctx.href,
      "status": ctx.status,
      "referer": ctx.get("referer"),
      "s-ip": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
    }); 
  } 
}
