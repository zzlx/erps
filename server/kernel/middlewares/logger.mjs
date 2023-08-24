/**
 * *****************************************************************************
 *
 * 构造日志对象并存储访问请求的状态
 *
 * *****************************************************************************
 */

export function logger () {
  return async function loggerMiddleware (ctx, next) {
    // 记录请求状态
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
    });

    await next(); // 执行中间件栈

    // setting responsed status
    ctx.state.set("log", Object.assign({}, {
      status: ctx.status,
      "response-time": ctx.get("x-response-time"),
    }, ctx.state.get("log")));

    // @todos: 
    // 格式化输出日志或写入文件
  };
}
