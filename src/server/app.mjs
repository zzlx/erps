/**
 * *****************************************************************************
 *
 * 服务配置
 * 
 *
 * *****************************************************************************
 */

import App from './kernel/application.mjs';
import * as m from './middlewares/index.mjs';
import { LOG_DIR, APP_CONFIG, } from '../config.mjs';
import routes from './routes.mjs';

const app = new App();

// 配置中间件栈
app.use(m.error(LOG_DIR));          // 捕获中间件级错误
app.use(m.xResponse());             // 记录中间件响应时间
app.use(m.cookies());               // cookie读写及签名
app.use(m.log(LOG_DIR));            // request log
app.use(m.cors());                  // 跨域访问响应
app.use(m.dba(APP_CONFIG));         // 数据库管理
app.use(routes());                  // 路由配置

export default app;
