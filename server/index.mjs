/**
 * *****************************************************************************
 * 
 * Http服务程序
 * ==============
 *
 * 🎆 静态文件服务
 * 💐 动态路由服务
 * 👏 API路由服务
 *
 * *****************************************************************************
 */

import path from 'path';

import App from './httpd/Application.mjs';
import compress from './httpd/middlewares/compress.mjs';
import cookies from './httpd/middlewares/cookies.mjs';
import cors from './httpd/middlewares/cors.mjs';
import error from './httpd/middlewares/error.mjs';
import logger from './httpd/middlewares/logger.mjs';
import markdown from './httpd/middlewares/markdown.mjs';
import xResponse from './httpd/middlewares/xResponse.mjs';

import settings from './settings/index.mjs';
import debuglog from './debuglog.mjs';
import router from './router.mjs';

const debug = debuglog('debug:/server');

// 设置进程标题
process.title = 'org.zzlx.httpd';

process.on('uncaughtException', (error, origin) => {
  console.log(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
});


// 初始化服务器程序
// 配置服务器基础功能
const app = new App({
  key: settings.privateKey,
  cert: settings.cert,
  passphrase: settings.passphrase,
});

app.use(error(path.join(settings.paths.PATH_LOG, 'error.log'))); // 记录中间件错误
app.use(logger(path.join(settings.paths.PATH_LOG, 'request.log'))); // 记录访问日志
app.use(xResponse()); // 响应时间记录
app.use(cors()); // 跨域访问支持
app.use(cookies()); // 全局cookie支持

// 服务器端路由配置
app.use(router.routes()); // 执行服务端路由配置
app.use(router.allowedMethods()); // 路由方法

// 根据条件对响应内容进行压缩
app.use(markdown()); // 启用markdown解析
app.use(compress()); // 启用内容压缩

// 启动服务端口
app.listen({ 
  ipv6Only: false, 
  exclusive: true,
  host: settings.host,
  port: settings.port,
}, function () {
  if (process.channel && process.send) {
    process.send({ 
      message: '服务器已启动',
      pid: process.pid,
      address: this.address(),
    });
  } else {
    debug('Http server is listening on:', this.address());
  }
});
