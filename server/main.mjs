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

// 重启服务前执行的任务
app.tasksBeforeListen = [
  cp.spawn(path.join(paths.SERVER, 'tasks', 'copy-umd-to-public.mjs')),
  cp.spawn(path.join(paths.SERVER, 'tasks', 'css-render.mjs')),
];

// 配置服务器功能
app.use(M.logger(paths.LOG_PATH));  // 记录访问日志\中间件错误
app.use(M.xResponse());            // 响应时间记录
app.use(M.cors());                 // 跨域访问支持
app.use(M.cookies());              // 全局cookie支持

// 配置服务器端路由
//app.use(router.routes());
//app.use(router.allowedMethods());
//
//routes.get('/assets*', assets.routes());
//
app.use((ctx, next) => {
  if (!/^\/docs/.test(ctx.pathname)) return next();
  let file = path.join(paths.DOCS, path.relative('/docs', ctx.pathname));
  if (file === paths.DOCS) file = path.join(file, 'README.md');
  if (path.extname(file) === '') file += '.md'
  if (!fs.existsSync(file)) return next();

  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({
    html: true,
  });

  const content = fs.readFileSync(file, 'utf8');
  const body = ctx.searchParams.get('raw') 
      ? `<pre contenteditable="true">${content}</pre>` 
      : md.render(content);

  html.body = `<div class="container markdown">${body}</div>`;

  ctx.body = html.render();
  return next();
});

app.env === 'development' && app.use(async (ctx, next) => {
  if (ctx.pathname !== '/assets/css/styles.css') return next();

  const scssFiles = readDir(path.join(paths.SRC, 'scss'));
  const cssFile = path.join(paths.WWW_PATH, 'assets', 'css', 'styles.css');
  await fs.promises.mkdir(path.dirname(cssFile), {recursive: true});
  const cssStats = fs.lstatSync(cssFile);

  for (let file of scssFiles) {
    const stats = fs.lstatSync(file);
    if (stats.mtime > cssStats.ctime) {
    //当发生样式文件修改时，自动重建styles.css文件
      await cp.spawn(path.join(paths.SERVER, 'tasks', 'css-render.mjs'));
      break;
    }
  }

  return next();
});

app.use(async (ctx, next) => {
  if (!/^\/api/.test(ctx.pathname)) return next();
  const apiFile = path.join(paths.SERVER, 'apis', path.relative('/api', ctx.pathname) + '.mjs');

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => m.default).then(app => {
      app(ctx, next);
    });
  }

  ctx.type = 'html';
  const html = new HTMLTemplate({ styles: ['/assets/css/styles.css'], });
  const md = new Remarkable({ html: true, });

  html.body = '<div class="container markdown">' + 
    md.render(fs.readFileSync(path.join(paths.SERVER, 'apis', 'README.md'), 'utf8')) +
  '</div>';

  html.title = 'API数据服务';
  ctx.body = html.render();
  return next();
});

// 静态资源服务
app.use(M.statics({ root: paths.WWW_PATH }));
app.use(M.statics({ root: paths.PUBLIC, prefix: '/assets' }));

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

// 内容压缩支持
app.use(M.compress());             

app.env === 'development' && app.use(ctx => {
  // dividing line
  const line = new Array(process.stdout.getWindowSize()[0]).join('-');
  debug(`
请求已被正确处理...
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
