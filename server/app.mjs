/**
 * *****************************************************************************
 *
 * Server-side application
 *
 * 基于KOA框架搭建的服务端后台程序,用于响应客户端请求.  
 *
 * Features:
 *
 * * Content-nogotiation
 * * 压缩传输
 *
 * *****************************************************************************
 */

import { Application } from "./koa/Application.mjs";
import { error, logger, xResponse } from "./middlewares/index.mjs";
import { objectID } from "./utils/objectID.mjs";
import { router } from "./router.mjs"; 

export const app = new Application({
  env: process.env.NODE_ENV || "production",      // default value is production
  keys: [String(objectID()), String(objectID())], // keys for encryept
  // ...
});

app.use(error());                 // 记录中间件错误
app.use(logger());                // 日志中间件
app.use(xResponse());             // 响应时间记录
app.use(router.routes());         // 服务端路由
app.use((ctx, next) => {          // 最内层中间件,用于判断中间件栈是否执行:w
  ctx.state.innerest_middleware = true;
  return next();
});
