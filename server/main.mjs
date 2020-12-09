/**
 * *****************************************************************************
 * 
 * 服务端主程序
 * ==============
 *
 * 🎆 静态文件服务
 * 💐 动态路由服务
 * 👏 API路由服务
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import util from 'util';

import { camelCase, console } from '../src/utils.lib.mjs';
import settings from '../src/settings.mjs';
import Koa from '../src/koa/Application.mjs';

import compress from '../src/koa/middlewares/compress.mjs';
import cookies from '../src/koa/middlewares/cookies.mjs';
import cors from '../src/koa/middlewares/cors.mjs';
import error from '../src/koa/middlewares/error.mjs';
import logger from '../src/koa/middlewares/logger.mjs';
import markdown from '../src/koa/middlewares/markdown.mjs';
import xResponse from '../src/koa/middlewares/xResponse.mjs';

import createServer from './utils/http2s.mjs';
import router from './router.mjs';

// 初始化服务器程序
const app = new Koa({ env: process.env.NODE_ENV });
const debug = util.debuglog('debug:main.mjs');
export default app;

// 配置http2 server
app.server = createServer({
  key: settings.privateKey,
  cert: settings.cert,
  passphrase: settings.passphrase, // 证书passphrase
  ticketKeys: crypto.randomBytes(48), 
}); 

// 服务重启时执行的任务清单:
app.tasksBeforeListen = [
  path.join(settings.paths.SERVER, 'tasks', 'copy-umd-to-assets.mjs'),
  path.join(settings.paths.SERVER, 'tasks', 'scss-render.mjs'),
];

// 配置服务器基础功能
app.use(error(path.join(settings.paths.LOG_PATH, 'error.log'))); // 记录中间件错误
app.use(logger(path.join(settings.paths.LOG_PATH, 'request.log'))); // 记录访问日志
app.use(xResponse()); // 响应时间记录
app.use(cors()); // 跨域访问支持
app.use(cookies()); // 全局cookie支持

// 服务器端路由配置
app.use(router.routes()); // 执行服务端路由配置
app.use(router.allowedMethods()); // 路由方法

// 根据条件对响应内容进行压缩
app.use(markdown()); // 启用markdown解析
app.use(compress()); // 启用内容压缩
