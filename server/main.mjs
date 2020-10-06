/**
 * *****************************************************************************
 * 
 * 服务端主程序
 * ==============
 *
 * 由中间件栈提供服务
 *
 *
 *
 *
 *
 *
 *
 *
 *
 *
 * *****************************************************************************
 */

import Koas from './koas/Application.mjs';
import * as M from './koas/middlewares/index.mjs';
import settings from './settings.mjs';
import router from './routes.mjs'; // 路由配置

// 准备程序
const paths = settings.paths;
const app = new Koas(); // 初始化Koas服务框架

// 通用中间件栈
app.use(M.logger(paths.LOG));     // 记录访问日志\中间件错误
app.use(M.xResponse());        // 记录中间件响应时间
app.use(M.cors());             // 跨域访问
app.use(M.cookies());          // cookie读写及签名

// 路由中间件,实现服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

// 模块输出 
export default app;
