/**
 * *****************************************************************************
 *
 * Service application.
 *
 * @file: main.mjs
 * *****************************************************************************
 */

import cp from 'child_process';
import fs from 'fs';
import path from 'path';
import util from 'util';

import './process-settings.mjs'; // import process logic
import Kernel from './kernel/application.mjs';
import * as m from './middlewares/index.mjs';
import { LOG_DIR, APP_CONFIG, } from '../config.mjs';
import createServer from './http2-server.mjs';

const debug = util.debuglog('debug:main'); // debug function

// get hostname
const hostname = cp.execSync("hostname | awk '{printf $1}'");

const app = new Kernel();

app.server = createServer({
	// @todo: read configuration from cofig file
	cert: fs.readFileSync(`/etc/ssl/${hostname}-cert.pem`),
	key: fs.readFileSync(`/etc/ssl/${hostname}-key.pem`),
}); 


// middlewares
app.use(m.xResponse());             // 记录中间件响应时间
app.use(m.error(LOG_DIR));          // 捕获中间件级错误
app.use(m.cookies());               // cookie读写及签名
app.use(m.log(LOG_DIR));            // request log
app.use(m.cors());                  // 跨域访问响应
app.use(m.dba(APP_CONFIG));         // 数据库管理

app.use(function router (ctx, next) {

  test();
});

app.listen({
	ipv6Only: false, // 是否仅开启IPV6
  host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
  port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
  exclusive: false, // false 可接受进程共享端口
});
