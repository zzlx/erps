/**
 * *****************************************************************************
 * 服务程序:
 *
 * 1. graphql服务;
 * 2. statics静态资源服务；
 * 
 * @file index.mjs
 * *****************************************************************************
 */

import path from 'path';
import App from './application.mjs';
import * as m from './middlewares/index.mjs';
import { 
  APP_HOME, 
  APP_LOG_PATH, 
  CONFIG, 
} from '../config.mjs';

const __dirname = path.dirname(import.meta.url).substr(7);

// 初始化服务程序
const app = new App(); 

// 配置服务器执行逻辑
app.use(m.error(APP_LOG_PATH));     // 捕获中间件错误
app.use(m.xResponse());             // 记录响应时间
app.use(m.cookies());               // 支持cookie读写
app.use(m.log(APP_LOG_PATH));       // 记录log
app.use(m.cors());                  // 跨域访问响应
app.use(m.mongodb(CONFIG.mongodb)); // mongo数据库
app.use(m.router(path.join(__dirname, 'services'))); // 服务端路由
app.use(m.notFound());

export default app; 
