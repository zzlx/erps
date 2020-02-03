/**
 * 服务程序:
 *
 * 1. graphql服务;
 * 2. statics静态资源服务；
 * 
 * @file index.mjs
 */
/******************************************************************************/

import path from 'path';

import Aok from './aok.mjs';
import * as m from './middlewares/index.mjs';
import { 
  APP_ROOT, 
  APP_HOME, 
  APP_LOG_PATH, 
  CONFIG, 
} from '../config.mjs';
import '../env.mjs';

const app = new Aok(); // 配置服务器执行逻辑
app.use(m.error(APP_LOG_PATH));     // 捕获中间件错误
app.use(m.xResponse());             // 记录响应时间
app.use(m.cookies());               // 支持cookie读写
app.use(m.log(APP_LOG_PATH));       // 记录log
app.use(m.cors());                  // 跨域访问响应
app.use(m.mongodb(CONFIG.mongodb)); // mongo数据库
app.use(m.router(path.join(APP_ROOT, 'src', 'services', 'apis'))); // 服务端路由
app.use(m.notFound());

export default app; 
