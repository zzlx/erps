/**
 * *****************************************************************************
 *
 * 主程序
 *
 * 1. graphql服务;
 * 2. statics静态资源服务；
 * 
 * @file index.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import Koa from './application.mjs';
import * as m from './middlewares/index.mjs';
import { 
  LOG_DIR, 
  APP_CONFIG, 
} from '../system.config.mjs';

const __dirname = path.dirname(import.meta.url).substr(7);

// 初始化服务程序
const app = new Koa({
  // @todo: read configuration from cofig file
  cert: fs.readFileSync('/etc/ssl/localhost-cert.pem'),
  key: fs.readFileSync('/etc/ssl/localhost-key.pem'),
}); 

//
// 配置服务器执行逻辑
//app.use(m.error(LOG_DIR));     // 捕获中间件错误
app.use(m.xResponse());             // 记录响应时间
app.use(m.cookies());               // 支持cookie读写
app.use(m.log(LOG_DIR));       // 记录log
app.use(m.cors());                  // 跨域访问响应
app.use(m.mongodb(APP_CONFIG.mongodb)); // mongo数据库
// 配置路由
app.use((ctx, next) => {
  //throw new Error('not not');
  ctx.throw(404, 'not found');
});

/**
 * 开启服务器监听
 */

app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  exclusive: false, // 是否共享进程端口
});

