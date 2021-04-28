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

import App from './Application.mjs';
import cors from './middlewares/cors.mjs';
import error from './middlewares/error.mjs';
import logger from './middlewares/logger.mjs';
import cookies from './middlewares/cookies.mjs';
import compress from './middlewares/compress.mjs';
import markdown from './middlewares/markdown.mjs';
import xResponse from './middlewares/xResponse.mjs';

import { paths, system } from '../settings/index.mjs';
import debuglog from '../debuglog.mjs';
import router from './routes.mjs';
import { websocket } from '../websocket.mjs';

const debug = debuglog('debug:httpd');

// This is the smart shutdown mode.
// After receiving SIGTERM the server disallows new connections, 
// but let the existing sessions and their work nornally.
process.on('SIGTERM', signal => {
  if (process.env.NODE_ENV === 'development') {
    // 开发环境中直接结束服务进程
    return process.exit();
  }

  app.server.close();
});

process.on('uncaughtException', (error, origin) => {
  console.log(error);
});

process.on('unhandledRejection', (reason, promise) => {
  console.log(reason);
});

// 初始化服务器程序
// 配置服务器基础功能
const app = new App({
  key: system.privateKey,
  cert: system.cert,
  passphrase: system.passphrase,
});

const ws = websocket({ server: app.server, });

ws.on('message', (msg, socket) => {
  debug(`Receive a websocket message: ${msg} from client(${socket.remoteAddress}:${socket.remotePort})`);
});

// he 'secureConnection' event is emitted after the handshaking process 
// for a new connection has successfully completed. 
//app.server.on('secureConnection', serverCtl);

app.use(error()); // 记录中间件错误
app.use(logger()); // 访问日志
app.use(xResponse()); // 响应时间记录
app.use(cors()); // 跨域访问支持
app.use(cookies()); // 全局cookie支持

// 服务器端路由配置
app.use(router.routes()); // 执行服务端路由配置
app.use(router.allowedMethods()); // 路由方法

// 根据条件对响应内容进行压缩
app.use(markdown()); // 启用markdown解析
app.use(compress()); // 启用内容压缩

app.listen({ 
  ipv6Only: false, 
  exclusive: true,
  host: system.isSupportIPv6 ? "::" : '0.0.0.0',
  port: '8888',
}, function () {
  if (process.channel && process.send) {
    process.send({ 
      message: '服务器已启动',
      pid: process.pid,
      address: this.address(),
    });
  } else {
    if (process.env.NODE_ENV === 'development') console.clear(); // clear console
    debug('The %s http daemon is listening on: %s', process.env.NODE_ENV, this.address());
  }
});

/**
 * 管理服务器
 */

function serverCtl (socket) {
  socket.on('data', buffer => {
    try {

      // 过滤数据帧
      if (buffer.readUInt8(0) !== 0b11111111) return; // 根据第一个字节判断
      const data = buffer.slice(1); 
      debug(data.toString());
      const message = JSON.parse(data.toString());

      if (message.token !== settings.passphrase) return; // 过滤socket

      switch(message.command) {
        case 'STOP': 
          app.server.close(() => { });
          break;

        case 'RESTART': 
          app.server.close(() => {
            start();
          });
          break;
        default:
          debug('Unknown Server Action.');
      }
    } catch (e) {
      debug(e); //不做处理
    }
  });
}
