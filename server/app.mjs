/**
 * *****************************************************************************
 *
 * Server-side application
 * =======================
 *
 * 基于KOA框架搭建的服务端后台程序,用于响应客户端请求.  
 *
 * # Features:
 *
 * * 支持内容协商
 * * ...
 *
 * *****************************************************************************
 */

import util from "node:util";
import { Application } from "./koa/Application.mjs";
import { cors, error, logger, xResponse } from "./middlewares/index.mjs";
import { objectID } from "./utils/objectID.mjs";
import { router } from "./router.mjs"; 

const debug = util.debuglog("debug:server-app");
export const app = new Application({
  env: process.env.NODE_ENV || "production",      // default value is production
  keys: [String(objectID()), String(objectID())], // keys for encryept
  // ...
});

app.use(error());                                 // 记录中间件错误
app.use(logger());                                // 日志中间件
app.use(xResponse());                             // 响应时间记录
app.use(cors());                                  // 跨域访问 
app.use(router.routes());                         // 服务端路由

app.use((ctx, next) => {                    // 最内层中间件,用于记录执行状态
  // 如果此中间件未被阻断,则设置状态为true
  ctx.state.innerest_middleware = true; 

  if (ctx.app.env === "development") {
    // debug(ctx.state);
  }
  // debug("ctx.body:", ctx.body);
});
