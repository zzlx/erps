/**
 * *****************************************************************************
 *
 * 后端服务程序及中间件栈提供各类服务功能
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import Koas from '../../src/koas/Application.mjs';
import cors from '../../src/koas/middlewares/cors.mjs';
import cookies from '../../src/koas/middlewares/cookies.mjs';
import error from '../../src/koas/middlewares/error.mjs';
import log from '../../src/koas/middlewares/log.mjs';
import xResponse from '../../src/koas/middlewares/xResponse.mjs';
import stream from '../../src/koas/middlewares/stream.mjs';

import config from '../../src/config/settings.mjs';
import WriteStream from '../../src/utils/WriteStream.mjs';
import { date } from '../../src/utils.mjs'; // @todo: 

import router from './routes.mjs'; // 路由配置

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`);
const paths = config.paths;
const logWriter = new WriteStream();

const app = new Koas();

// setting log middlware at the first, so erros can be record.
const logger = (log) => {
  logWriter.path = path.join(paths.HOME, 'log', date.format('yyyymmdd') + '.log');
  logWriter.write(Object.values(log).join('\t') + '\n');
}

app.use(log(logger));        // 日志组件
app.use(error());            // 捕获中间件级错误
app.use(xResponse());        // 记录中间件响应时间
app.use(cors());             // 跨域访问
app.use(cookies());          // cookie读写及签名
app.use(router.routes());
app.use(router.allowedMethods());

export default app.callback();
