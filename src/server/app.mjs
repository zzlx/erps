/**
 * *****************************************************************************
 *
 * 服务配置
 * 
 *
 * *****************************************************************************
 */

import App from './kernel/Application.mjs';
import * as m from './middlewares/index.mjs';
import routes from './routes.mjs';
import Config from '../utils/Config.mjs';

const app = new App();
const config = new Config();

// 配置中间件栈
app.use(m.error(config.logDir));    // 捕获中间件级错误
app.use(m.xResponse());             // 记录中间件响应时间
app.use(m.cookies());               // cookie读写及签名
app.use(m.log(config.logDir));      // request log
app.use(m.cors());                  // 跨域访问响应
app.use(m.dba(config));             // 数据库管理
app.use(routes());                  // 路由配置

//  
export default app;
