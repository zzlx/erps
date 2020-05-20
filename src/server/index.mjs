/**
 * *****************************************************************************
 *
 * HTTPD服务
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

// 进程管理
// 初始化系统环境 
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
process.title = process.title + '.' + 'httpd';

// 定义pidFile文件路径
const pidFile = `${process.env.HOME}/.${process.title}.pid`;

// 将process.pid写入PID文件
fs.promises.writeFile(pidFile, String(process.pid), 'utf8')
	.catch(err => console.log(err));

const onExit = () => {
	console.log('使用Control+C结束进程')
	// 任务1: 删除pidFile
	fs.promises.unlink(pidFile).catch(err => console.log(err));
	process.exit();
}

process.on('SIGINT', onExit);

const __dirname = path.dirname(import.meta.url).substr(7);

// 初始化服务程序
const app = new Koa({
  // @todo: read configuration from cofig file
  cert: fs.readFileSync('/etc/ssl/localhost-cert.pem'),
  key: fs.readFileSync('/etc/ssl/localhost-key.pem'),
}); 

//
// 配置服务器执行逻辑
//app.use(m.error(LOG_DIR));        // 捕获中间件错误
app.use(m.xResponse());             // 记录响应时间
app.use(m.cookies());               // 支持cookie读写
app.use(m.log(LOG_DIR));            // 记录log
app.use(m.cors());                  // 跨域访问响应
//app.use(m.mongodb(APP_CONFIG.mongodb)); // mongo数据库
//
// 配置路由
app.use((ctx, next) => {

	ctx.body = 'test';
  //throw new Error('not not');
  //ctx.throw(404, 'not found');
});

// 开启服务器监听
app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  exclusive: false, // 是否共享进程端口
});
