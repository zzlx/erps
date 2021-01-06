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

import path from 'path';
import crypto from 'crypto';
import util from 'util';

import { camelCase, console } from '../utils.lib.mjs';
import settings from '../settings/index.mjs';
import Koa from '../koa/Application.mjs';

import compress from '../koa/middlewares/compress.mjs';
import cookies from '../koa/middlewares/cookies.mjs';
import cors from '../koa/middlewares/cors.mjs';
import error from '../koa/middlewares/error.mjs';
import logger from '../koa/middlewares/logger.mjs';
import markdown from '../koa/middlewares/markdown.mjs';
import xResponse from '../koa/middlewares/xResponse.mjs';

import router from './router.mjs';

const debug = util.debuglog('debug:server/main.mjs');

// 初始化服务器程序
const app = new Koa({ env: process.env.NODE_ENV });

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

export default app;
