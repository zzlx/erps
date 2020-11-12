/**
 * *****************************************************************************
 * 
 * 服务端主程序
 * ==============
 *
 * 🎆 静态文件服务
 * 💐 动态路由服务
 * 👏 API路由服务
 *
 * @TODOS:
 * 1. 读取log/request.log时,readStream无法关闭
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import Remarkable from 'remarkable';
import settings from './settings.mjs';
import Koa from './koa/Application.mjs';
import * as M from './koa/middlewares/index.mjs';
import server from './http2-server.mjs';
//import { routes as router } from './routes.mjs';

process.title = 'erps.httpd'; // 设置进程名称
const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;

// 初始化服务器程序
const app = new Koa({
  //keys: ['enpseC5vcmc='],
  server: server,
});

// 服务启动前执行的任务:
// 准备前端项目的依赖文件
app.tasksBeforeListen = [
  path.join(paths.BIN, 'copy-umd-to-public.mjs'),
  path.join(paths.BIN, 'css-render.mjs'),
];

// 配置服务器功能
app.use(M.error(paths.LOG_PATH)); // 记录中间件错误
app.use(M.logger(paths.LOG_PATH)); // 记录访问日志
app.env === 'development' && app.use(M.xResponse(settings)); // 响应时间记录
app.use(M.cors()); // 跨域访问支持
app.use(M.cookies()); // 全局cookie支持

// @TODO: 内存缓存服务

// 静态资源服务配置
app.use(M.statics({ root: paths.WWW_PATH, directoryIndex: 'index.html' }));
app.use(M.statics({ root: paths.PUBLIC, prefix: '/assets', }));
app.use(M.statics({ root: paths.DOCS, prefix: '/docs', 
  directoryIndex: 'README.md' 
}));

// @TODO: 读取request.log时存在错误
'development' === app.env && app.use(M.statics({ root: paths.LOG_PATH, 
  prefix: '/log' 
}));

// pages目录路由配置
app.use(M.dynamics({ path: paths.PAGES }));

// 启用内容压缩
//app.use(M.compress({threshold: app.compressThreshold}));             

app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.ipv6 ? '::' : '0.0.0.0',
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
}, () => { 
  console.log('The %s Server is running on %o.', 
    process.env.NODE_ENV, 
    app.server.address()
  );
});
