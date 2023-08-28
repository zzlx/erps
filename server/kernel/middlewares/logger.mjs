/**
 * *****************************************************************************
 *
 * 构造日志对象并存储访问请求的状态
 *
 * *****************************************************************************
 */

export function logger () {
  return async function loggerMiddleware (ctx, next) {
    await next();

    ctx.state.set("log", {
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
      status: ctx.status,
      "response-time": ctx.get("x-response-time"),
    });

    // @todos: 
    // 格式化输出日志或写入文件
  };
}
