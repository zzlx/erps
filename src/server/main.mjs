/**
 * *****************************************************************************
 *
 * 配置服务
 *
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

import './process.mjs'; // 载入进程管理模块
import Kernel from './kernel/application.mjs';
import * as m from './middlewares/index.mjs';
import { LOG_DIR, APP_CONFIG, } from '../config.mjs';

const debug = util.debuglog('debug:application'); // debug function
const hostname = cp.execSync("hostname | awk '{printf $1}'");

const app = new Kernel({
	// @todo: read configuration from cofig file
	cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
	key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
}); 

// 配置服务器执行逻辑
app.use(m.error(LOG_DIR));          // 捕获中间件错误
app.use(m.xResponse());             // 记录响应时间
app.use(m.cookies());               // 支持cookie读写
app.use(m.log(LOG_DIR));            // 记录log
app.use(m.cors());                  // 跨域访问响应
//app.use(m.mongodb(APP_CONFIG.mongodb)); // mongo数据库

app.use((ctx, next) => {
	ctx.body = "hello"

});

app.listen({
	ipv6Only: false, // 是否仅开启IPV6
  host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  exclusive: false, // 是否共享进程端口
});
