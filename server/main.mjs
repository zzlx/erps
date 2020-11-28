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

import fs from 'fs';
import path from 'path';
import util from 'util';

import { camelCase, console } from '../src/utils.lib.mjs';
import settings from '../src/settings.mjs';
import Koa from '../src/koa/Application.mjs';
import { 
  error, logger, cors, cookies, xResponse, compress, serverRender, 
} from '../src/koa/middlewares/index.mjs';
import createServer from './http2-server.mjs';
import { router } from './routes/index.mjs';

const paths = settings.paths;
const debug = util.debuglog('debug:main.mjs');

// 初始化服务器程序
const app = new Koa({
  keys: settings.keys || 'erps',
  serverCreator: createServer,
  compressThreshold: 1*1024,
});

// 服务重启时执行的任务清单:
// 无保证的任务
app.tasksBeforeListen = [
  path.join(paths.BIN, 'copy-public-to-www.mjs'),
  path.join(paths.BIN, 'copy-umd-to-www.mjs'),
  path.join(paths.BIN, 'css-render.mjs'),
];

// 配置服务器基础功能
app.use(error(path.join(paths.LOG_PATH, 'error.log')));  // 记录中间件错误
app.use(logger(path.join(paths.LOG_PATH, 'request.log'))); // 记录访问日志
app.use(xResponse(settings));    // 响应时间记录
app.use(cors());                 // 跨域访问支持
app.use(cookies());              // 全局cookie支持
app.use(router.routes()); // 执行服务端路由配置
app.use(router.allowedMethods()); // 路由方法
app.use(compress({ threshold: app.compressThreshold })); // 启用内容压缩

// 开启监听
app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.ipv6 ? '::' : '0.0.0.0',
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
}, function () { 
  // 打印服务器状态信息
  console.monitor(
    `${camelCase(process.env.NODE_ENV)} server is running on : %o.`, 
    this.address()
  ); 
});
