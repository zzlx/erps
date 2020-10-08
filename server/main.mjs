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

import Koas from './koas/Application.mjs';
import * as M from './koas/middlewares/index.mjs';

import settings from './config/settings.mjs';
import router from './routes.mjs'; // 主路由配置

// 准备程序
const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;
const app = new Koas(); // 初始化Koas服务框架

// 通用中间件栈
app.use(M.logger(paths.LOG));  // 记录访问日志\中间件错误
app.use(M.xResponse());        // 记录中间件响应时间
app.use(M.cors());             // 跨域访问
app.use(M.cookies());          // 全局cookie支持

// Test
let counter = 0;

app.use((ctx, next) => {
  debug('Request count:', ++counter);
  next();
});

// 服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

// 模块输出 
export default app;
