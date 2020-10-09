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
import Kos from '../src/kos/Application.mjs';
import * as M from '../src/kos/middlewares/index.mjs';
import router from '../server/routes.mjs'; // 主路由配置

// 配置服务器程序
const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;
const app = new Kos(); // 初始化服务器程序
export default app; // 输出服务器端程序

// 配置基础服务中间件
app.use(M.logger(paths.LOG));  // 记录访问日志\中间件错误
app.use(M.xResponse());        // 响应时间记录
app.use(M.cors());             // 跨域访问支持
app.use(M.cookies());          // 全局cookie支持

// 服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

// 最后一个中间件
app.use(function theLastOneMiddleware (ctx, next) {
  if (null == ctx.body) {
    ctx.status = ctx.status || 404;
    ctx.body = ctx.message;
  }

  debug(`
--------------------------------------------------------------------------------
Congratulations! 🎆💐请求已被处理完毕...
--------------------------------------------------------------------------------
请求URL: ${ctx.href}
响应状态: ${ctx.status}
响应内容: ${ctx.body}
--------------------------------------------------------------------------------
  `);

  return next();
});
