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
import { Application } from "./kernel/Application.mjs";
import { 
  cors, error, logger, postgresql, xResponse,
} from "./kernel/middlewares/index.mjs";
import { objectID } from "./utils/objectID.mjs";

const debug = util.debuglog("debug:backend-app");

debug("开始初始化服务程序...");

export const app = new Application({
  env: process.env.NODE_ENV || "production",      // default value is production
  keys: [String(objectID()), String(objectID())], // keys for encryept
  // ...
});

app.use(error()); // 记录中间件错误
app.use(logger()); // 日志中间件
app.use(xResponse()); // 响应时间记录
app.use(cors()); // 跨域访问 
app.use(postgresql()); // 应用数据库

const router = await import("./routes/index.mjs").then(m => m.router);
app.use(router.routes()); // 配置服务端路由

app.use(async function (ctx, next) { // 最内层中间件,用于记录执行状态
  ctx.state.set("innerest_middleware", true); // 如果此中间件未被阻断,则设置状态为true

  if (ctx.app.env === "development") {
    // const result = await ctx.dba.query("SELECT now()");
    // debug(result);
    // debug("totalcount:", ctx.dba.totalCount);
    // debug("idlecount:", ctx.dba.idleCount);
    //debug(typeof ctx.state.get("log"));
  }

  await next();
});
