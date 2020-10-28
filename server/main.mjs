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
import fs from 'fs';
import path from 'path';
import util from 'util';

import Remarkable from 'remarkable';
import {inspect} from './utils.lib.mjs';

//import createStore from '../public/store/createStore.mjs';
import settings from './config/settings.mjs';
import Koa from './koa/Application.mjs';
import * as M from './koa/middlewares/index.mjs';
//import { routes as router } from './routes.mjs';
import { HTMLTemplate } from './koa/middlewares/serverSideRendering.mjs';

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

// 服务启动前执行的任务:
// 准备前端项目的依赖文件
app.tasksBeforeListen = [
  cp.spawn(path.join(paths.TASKS, 'copy-umd-to-public.mjs')),
  cp.spawn(path.join(paths.TASKS, 'css-render.mjs')),
];

// 配置服务器功能
app.use(M.error(paths.LOG_PATH));  // 记录中间件错误
app.use(M.logger(paths.LOG_PATH));  // 记录访问日志
app.env === 'development' && 
app.use(M.xResponse(settings));    // 响应时间记录
app.use(M.cors());                 // 跨域访问支持
app.use(M.cookies());              // 全局cookie支持

// @TODO: 内存缓存服务

// 静态资源服务
app.use(M.statics({ root: paths.WWW_PATH }));
app.use(M.statics({ root: paths.PUBLIC, prefix: '/assets', }));
app.use(M.statics({ root: paths.DOCS, prefix: '/docs', 
  directoryIndex: 'README.md' 
}));

// API服务
app.use(async (ctx, next) => {
  if (!/^\/api/.test(ctx.pathname)) return next();
  const apiFile = path.join(paths.SERVER, 'pages', path.relative('/', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    const api = await import(apiFile).then(m => m.default);
    await api.call(ctx, ctx);
    return next();
  }

  return next();
});

app.use(M.serverSideRendering({
  styles: [ "/assets/css/styles.css" ],
  scripts: [
    //{ src: "https://hm.baidu.com/hm.js?6d232be7bbac84648183642dea1aac4b" },
    { src: `/assets/js/react.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/js/react-dom.${process.env.NODE_ENV === 'development' ? 'development' : 'production.min'}.js` },
    { src: `/assets/main.mjs${process.env.NODE_ENV === 'development' ? '?env=development' : '' }`, module: true, crossorigin: true },
    { src: "/assets/noFallback.js", nomodule: true},
  ],
}));

// 启用内容压缩支持
app.use(M.compress({threshold: app.compressThreshold}));             

// @TEST
// 开发环境下控制台输出respond信息
app.env === 'development' && app.use((ctx, next) => {
  const line = new Array(process.stdout.getWindowSize()[0]).join('-');
  debug(`
响应内容监测信息:
${line}
客户端: ${ctx.get('user-agent')}
请求类型: ${ctx.method}
请求路径: ${ctx.pathname}
响应状态: ${ctx.status}
响应内容编码: ${ctx.get('content-encoding')}
响应内容类型: ${ctx.type}
响应内容: ${inspect(ctx.body)}
${line}
  `);

  return next();
});

app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.ipv6 ? '::' : '0.0.0.0',
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
});

/**
 * 循环读取目录,返回文件路径列表
 *
 * @param {string} dir
 */

function readDir (dir) {
  let file_lists = []; // 文件列表
  
  if (Array.isArray(dir)) {
    for (let d of dir) file_lists = file_lists.concat(readDir(d));
  }

  if (typeof dir === 'string' && fs.existsSync(dir)) {

    const files = fs.readdirSync(dir, {withFileTypes: true});

    for (let file of files) {
      const filePath = path.join(dir, file.name);
      if (file.isFile()) file_lists.push(filePath);
      if (file.isDirectory()) file_lists = file_lists.concat(readDir(filePath));
    }
  }

  return file_lists;
}
