/**
 * *****************************************************************************
 * 
 * 服务端主程序
 * ==============
 *
 * 实现服务器功能逻辑
 *
 * *****************************************************************************
 */

import util from 'util';
import settings from '../config/settings.mjs';
import Koa from '../src/koa/Application.mjs';
import * as M from '../src/koa/middlewares/index.mjs';
import router from '../server/routes.mjs';

const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;

// 初始化服务器程序
const app = new Koa({
  env: process.env.NODE_ENV, // 服务器执行环境
  compressThreshold: 256,    // 压缩阈值,超过256kb的内容将被压缩后传递给客户端
});

export default app;                // 输出服务器端程序

// 配置服务器功能
app.use(M.logger(paths.APP_LOG));  // 记录访问日志\中间件错误
app.use(M.xResponse());            // 响应时间记录
app.use(M.cors());                 // 跨域访问支持
app.use(M.cookies());              // 全局cookie支持

// 配置服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

// 内容压缩支持
app.use(M.compress());             


// 开发环境下测试的项目
app.env === 'development' && app.use(async (ctx, next) => {
  // @Task:
  //
  
  // @Task: 测试请求被处理的情况
  debug(`
--------------------------------------------------------------------------------
🎆💐请求已进入响应阶段...
--------------------------------------------------------------------------------
请求URL: ${ctx.href}
响应状态: ${ctx.status}
响应内容: ${ctx.body}
--------------------------------------------------------------------------------
  `);

  return await next(); // 传递至服务器请求处理程序
});
