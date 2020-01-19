/**
 * 服务列表:
 * 1. graphql服务;
 * 2. statics静态资源服务；
 * 
 * @file httpd.mjs
 */
/******************************************************************************/

import fs from 'fs';
import path from 'path';
import Aok from './aok/application.mjs';
import getModulesFromPath from '../utils/getModulesFromPath.mjs';
import { 
  APP_ROOT, 
  APP_HOME, 
  APP_LOG_PATH,
  CONFIG_FILE,
} from '../config.mjs';
import '../env.mjs';

async function httpd () {
  // 加载配置项
  const config = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8')); 
  const m = await getModulesFromPath(
    path.join(APP_ROOT, 'src', 'server', 'middlewares')
  );

  // 配置服务器执行逻辑
  const app = new Aok();
  app.use(m.error(APP_LOG_PATH));     // 捕获中间件错误
  app.use(m.xResponse());             // 记录响应时间
  app.use(m.cookies());               // 支持cookie读写
  app.use(m.log(APP_LOG_PATH));       // 记录log
  app.use(m.cors());                  // 跨域访问响应
  app.use(m.mongodb(config.mongodb)); // mongo数据库
  app.use(m.router(path.join(APP_ROOT, 'src', 'services'))); // 服务端路由
  app.use(m.notFound());

  /**
   * 开启服务器监听
   */

  app.listen({
    ipv6Only: false, // 是否仅开启IPV6
    host: process.env.IPV6 ? '::' : '0.0.0.0', // 绑定服务器主机名
    port: process.env.PORT ? Number.parseInt(process.env.PORT, 10) : 3000,
    exclusive: false, // 是否共享进程端口
  });
}

export default httpd();
