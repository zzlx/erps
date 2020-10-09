/**
 * *****************************************************************************
 * 
 * 服务端主程序
 * ==============
 *
 *
 *
 * *****************************************************************************
 */

import util from 'util';
import Koas from '../src/koas/Application.mjs';
import * as M from '../src/koas/middlewares/index.mjs';
import settings from '../src/config/settings.mjs';
import router from '../server/routes.mjs'; // 主路由配置

// 配置服务器程序
const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;
const app = new Koas(); // 初始化服务器程序
export default app; // 输出服务器端程序

// middlewares
app.use(M.logger(paths.LOG));  // 记录访问日志\中间件错误
app.use(M.xResponse());        // 记录中间件响应时间
app.use(M.cors());             // 跨域访问
app.use(M.cookies());          // 全局cookie支持

// 服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

app.env === 'development' && app.use(function test (ctx, next) {

  // 检查响应请求的信息
  debug('Request log:', ctx.state.log);
  debug('Respond body:', ctx.body);

  next();
});
