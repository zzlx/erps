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
import { postgresql } from "./middlewares/index.mjs";
import { objectID } from "./utils/objectID.mjs";

const debug = util.debuglog("debug:server-app");

export const app = new Application({
  env: process.env.NODE_ENV || "production", // default value is production
  keys: [String(objectID()), String(objectID())], // keys for encryept
  proxy: false,
  // ...
});

// Error handler
app.on("error", (err, ctx) => {
  debug(err);
  debug("pathname:", ctx.pathname);
});

app.use(error()); // 记录中间件错误
app.use(logger()); // 日志中间件
app.use(xResponse()); // 响应时间记录
app.use(cors()); // 跨域访问
app.use(postgresql()); // 应用数据库

// 配置服务端路由
const router = await import("../../routes/index.mjs").then(m => m.router);
app.use(router.routes()); 

// The last one of the middleware stack
app.use(async function (ctx) { 
  // 用于标记中间件栈是否被完整的执行
  // 如果此中间件未被阻断,则设置状态为true
  ctx.state.set("innerest_middleware", true); 

  if (ctx.app.env !== "development") return;

  // Test: 用于开发环境下测试请求被处理的情况
  // debug("当前访问页面地址:", ctx.pathname);
  // const result = await ctx.dba.query("SELECT now()");
  // debug(result);
  // debug("totalcount:", ctx.dba.totalCount);
  // debug("idlecount:", ctx.dba.idleCount);
  // debug(typeof ctx.state.get("log"));
  // debug(typeof ctx.status);
  // debug(ctx.pathname);
  // debug(ctx.state);
  // debug(ctx.request);
});
