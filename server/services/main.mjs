/**
 * *****************************************************************************
 *
 * Backend Services
 * ================
 *
 * 后端服务程序及中间件栈提供各类服务功能
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import Koa from '../koa/Application.mjs';
import cors from '../koa/middlewares/cors.mjs';
import cookies from '../koa/middlewares/cookies.mjs';
import error from '../koa/middlewares/error.mjs';
import log from '../koa/middlewares/log.mjs';
import xResponse from '../koa/middlewares/xResponse.mjs';
import router from './routes.mjs'; // 路由配置

import config from '../config/settings.mjs';
import WriteStream from '../utils/WriteStream.mjs';
import { date } from '../utils.mjs'; // @todo: 

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`);
const paths = config.paths;
const logWriter = new WriteStream();

const app = new Koa();

// setting log middlware at the first, so erros can be record.
app.use(log((log) => {
  logWriter.path = path.join(paths.logPath, date.format('yyyymmdd') + '.log');
  logWriter.write(Object.values(log).join('\t') + '\n');
}));

app.use(error());            // 捕获中间件级错误
app.use(xResponse());        // 记录中间件响应时间
app.use(cors());             // 跨域访问
app.use(cookies());          // cookie读写及签名
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
