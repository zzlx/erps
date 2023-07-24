/**
 * *****************************************************************************
 *
 * 记录单次访问请求的状态
 *
 * *****************************************************************************
 */

export function logger () {
  return async function loggerMiddleware (ctx, next) {
    // 记录请求状态
    ctx.state.log = {
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
    ctx.state.log.status = ctx.status;

    // print request log in production environment
    // @todos: 
    // 增加格式化输出
    // 日志文件写入文件
    // if (ctx.app.env !== "development") console.log(JSON.stringify(log));
    console.log(JSON.stringify(ctx.state.log));
  };
}
