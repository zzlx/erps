/**
 * Http service application.
 *
 * 服务列表:
 * 1. graphql服务;
 * 2. statics静态资源服务；
 *
 */

import fs from 'fs';
import path from 'path';

import { application as App, } from './common/index.mjs';
import * as m from './middlewares/index.mjs';
import routes from './routes.mjs';
import { APP_PATH, APP_HOME } from '../config.common.mjs';

// 实例化服务程序
const app = new App();

// 加载配置 @todo：再第一次运行时进行配置，并保存到用户配置目录中
const configFile = path.join(APP_HOME, 'config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8')); 
const logPath = path.join(APP_HOME, 'log');

// 配置服务中间件
app.use(m.error(logPath));       // 捕获中间件错误
app.use(m.xResponse());          // 记录响应时间
app.use(m.cookies());            // 支持cookie读写
app.use(m.log(logPath));         // 记录log
app.use(m.cors());               // 跨域访问响应
app.use(m.mongodb(config.mongodb)); // mongo数据库
app.use(m.router(routes));

// 开启监听
app.listen({
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '::', 
  exclusive: false,
  ipv6Only: false,
});
