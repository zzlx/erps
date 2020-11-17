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

import Remarkable from 'remarkable';

import { camelCase, console } from '../src/utils.lib.mjs';
import settings from '../src/settings.mjs';
import Koa, { 
  error, logger, cors, cookies, dynamics, statics, xResponse,
  compress,
} from '../src/koa/Application.mjs';
import server from './http2-server.mjs';
import Index from './routes/Index.mjs';

const debug = util.debuglog('debug:main.mjs');
const paths = settings.paths;

// 初始化服务器程序
const app = new Koa({
  keys: settings.keys || 'erps',
  server: server,
});

// 服务启动前执行的任务:
// 准备前端项目的依赖文件
app.tasksBeforeListen = [
  path.join(paths.BIN, 'copy-umd-to-public.mjs'),
  path.join(paths.BIN, 'css-render.mjs'),
];

// 服务器基础功能配置
app.use(error(paths.LOG_PATH)); // 记录中间件错误
app.use(logger(paths.LOG_PATH)); // 记录访问日志
app.env === 'development' && 
app.use(xResponse(settings)); // 响应时间记录
app.use(cors()); // 跨域访问支持
app.use(cookies()); // 全局cookie支持

// 执行服务端路由配置
app.use(Index.routes());
app.use(Index.allowedMethods());

// 启用内容压缩-超过512kb时启用压缩
app.use(compress({ threshold: 512 * 1024 }));

app.listen({
  ipv6Only: false, // 是否仅开启IPV6
  host: settings.system.ipv6 ? '::' : '0.0.0.0',
  port: settings.system.port,
  exclusive: false, // false 可接受进程共享端口, 支持集群服务器配置
}, function () { 
  // 打印服务器状态信息
  console.monitor(
    `${camelCase(process.env.NODE_ENV)} Server is running on : %o.`, 
    this.address()
  ); 
});
