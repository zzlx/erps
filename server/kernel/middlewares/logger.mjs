/**
 * *****************************************************************************
 *
 * 构造日志对象并存储访问请求的状态
 *
 * *****************************************************************************
 */

export function logger () {
  return async function loggerMiddleware (ctx, next) {
    ctx.state.set("log", {
      "atimeMs": Date.now(),
      "c-address": ctx.socket.remoteAddress,
      "c-port": ctx.socket.remotePort,
      "user-agent": ctx.get("user-agent"),
      "method": ctx.method,
      "href": ctx.href,
      "referer": ctx.get("referer"),
      "s-address": ctx.socket.localAddress,
      "s-port": ctx.socket.localPort,
      "s-pid": process.pid,
    });

    await next();

    ctx.state.set("log", Object.assign(ctx.state.get("log"), {
      "status": ctx.status,
      "rt": ctx.get("x-response-time"),
    }));

    // @todos: 
    // 格式化输出日志或写入文件
    // eslint-disable-next-line
    if (ctx.app.env !== "development") console.log("%j", ctx.state.get("log"));
  };
}
