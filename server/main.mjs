/**
 * *****************************************************************************
 * 
 * 后端服务主程序
 * ==============
 *
 * 由中间件栈提供各类服务
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import Koas from '../src/koas/Application.mjs';
import * as M from '../src/koas/middlewares/index.mjs';

import config from '../src/config/settings.mjs';
import WriteStream from '../src/utils/WriteStream.mjs';
import { date } from '../src/utils.mjs'; // @todo: 

import router from './routes.mjs'; // 路由配置

const debug = util.debuglog(`debug:main.mjs`);
const paths = config.paths;
const logWriter = new WriteStream();

const app = new Koas();

// setting log middlware at the first, so erros can be record.
const logger = (log) => {
  logWriter.path = path.join(paths.HOME, 'log', date.format('yyyymmdd') + '.log');
  logWriter.write(Object.values(log).join('\t') + '\n');
}

app.use(M.log(logger));        // 日志组件
app.use(M.error());            // 捕获中间件级错误
app.use(M.xResponse());        // 记录中间件响应时间
app.use(M.cors());             // 跨域访问
app.use(M.cookies());          // cookie读写及签名
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
