/**
 * *****************************************************************************
 *
 * A backend services application
 *
 *
 * *****************************************************************************
 */

import Kos from './kos/Application.mjs';

import error from './kos/middlewares/error.mjs';
import log from './kos/middlewares/log.mjs';
import xResponse from './kos/middlewares/xResponse.mjs';
import cookies from './kos/middlewares/cookies.mjs';
import cors from './kos/middlewares/cors.mjs';
import dba from './kos/middlewares/dba.mjs';
import reactDOM from './kos/middlewares/reactDOM.mjs';

import config from './config.js';
import router from './routes/index.mjs';

const app = new Kos({
  env: process.env.NODE_ENV || 'production',
});

app.use(error());            // 捕获中间件级错误
app.use(log());              // request log
app.use(xResponse());        // 记录中间件响应时间
app.use(cookies());          // cookie读写及签名
app.use(cors());             // 跨域访问响应
app.use(dba(config));        // 数据库管理
app.use(reactDOM());         // react dom server
app.use(router.routes());
app.use(router.allowedMethods());

export default app;
