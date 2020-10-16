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
 * *****************************************************************************
 */

import cp from 'child_process';
import http2 from 'http2';
import util from 'util';
import path from 'path';

import settings from './config/settings.mjs';
import Koa from './koa/Application.mjs';
import * as M from './koa/middlewares/index.mjs';
import { routes as router } from './routes.mjs';

process.title = 'erps.httpd'; // 设置进程名称
const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;

// 初始化服务器程序
const app = new Koa({
  keys: ['enpseC5vcmc='],
  key: settings.privateKey,
  cert: settings.cert,
  allowHTTP1: true,
  //ca: [fs.readFileSync('client-cert.pem')],
  //sigalgs: 
  //ciphers: 
  //clientCertEngine: 
  //dhparam
  //ecdhCurve
  //privateKeyEngine
  passphrase: settings.passphrase,
  //pfx: fs.readFileSync('etc/ssl/localhost_cert.pfx'),
  sessionTimeout: 300, // seconds
  handshakeTimeout: 120000, // milliseconds
});

// 重启服务前执行的任务
app.tasksBeforeListen = [
  //cp.spawn(path.join(paths.SERVER, 'tasks', 'copy-umd-to-public.mjs')),
  //cp.spawn(path.join(paths.SERVER, 'tasks', 'css-render.mjs')),
];

// 配置服务器功能
app.use(M.logger(paths.LOG_PATH));  // 记录访问日志\中间件错误
app.use(M.xResponse());            // 响应时间记录
app.use(M.cors());                 // 跨域访问支持
app.use(M.cookies());              // 全局cookie支持

// 配置服务器端路由
app.use(router.routes());
app.use(router.allowedMethods());

// 内容压缩支持
app.use(M.compress());             

app.env === 'development' && app.use(ctx => {
  // dividing line
  const line = new Array(process.stdout.getWindowSize()[0]).join('-');
  debug(`
开发环境中检查请求是否已被正确处理...
${line}
客户端: ${ctx.get('user-agent')}
请求类型: ${ctx.method}
请求路径: ${ctx.pathname}
响应内容类型: ${ctx.type}
响应状态: ${ctx.status}
${line}
`);
});

app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.ipv6 ? '::' : '0.0.0.0',
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
});
