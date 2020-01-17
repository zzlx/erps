/*
 * Http service application.
 *
 * 服务列表:
 * 1. graphql服务;
 * 2. statics静态资源服务；
 * 
 * @file httpd.mjs
 */
/******************************************************************************/

import fs from 'fs';
import path from 'path';

import Application from './onion-kernel/application.mjs';
import * as m from './middlewares/index.mjs';
import routes from './routes.mjs';
import { 
  APP_PATH, 
  APP_HOME,
  CONFIG_FILE,
} from '../config.mjs';

// 加载配置项
const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); 
const logPath = path.join(APP_HOME, 'log');

/**
 * 配置服务
 *
 */

const app = new Application();
app.use(m.error(logPath));       // 捕获中间件错误
app.use(m.xResponse());          // 记录响应时间
app.use(m.cookies());            // 支持cookie读写
app.use(m.log(logPath));         // 记录log
app.use(m.cors());               // 跨域访问响应
app.use(m.mongodb(config.mongodb)); // mongo数据库
app.use(m.router(routes));

/**
 * 开启服务器监听
 */

app.listen({
  // 绑定服务器主机端口
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  // 绑定服务器主机名
  host: process.env.HOST ? process.env.HOST : process.env.IPV6 ? '::' : '0.0.0.0',
  ipv6Only: process.env.IPV6 ? true : false, // 是否仅开启IPV6
  exclusive: false, // 是否共享进程端口
});
