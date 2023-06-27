/**
 * *****************************************************************************
 *
 * 服务端处理程序
 *
 * 基于KOA框架搭建的服务端后台程序,用于响应客户端请求.  
 *
 * Features
 *
 * * 内容协商
 * * 压缩传输
 *
 * *****************************************************************************
 */

import util from 'util';
import { Application } from './koa/Application.mjs';
import { error, logger, xResponse } from './middlewares/index.mjs';
import { objectID } from './utils/objectID.mjs';
import { router } from './router.mjs'; 

const debug = util.debuglog('debug:server-side-app');

export const app = new Application({
  env: process.env.NODE_ENV || 'production', // default value is production
  keys: [String(objectID()), String(objectID())],
  // ...
});

app.use(error());                 // 记录中间件错误
app.use(logger());                // 日志中间件
app.use(xResponse());             // 响应时间记录
app.use(router.routes());         // 服务端路由
app.use((ctx, next) => {
  ctx.state.innerest_middleware = true; // 最内层中间件
  //debug('context:', ctx);
});
