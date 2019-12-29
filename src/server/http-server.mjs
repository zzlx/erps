/**
 * Http service application.
 *
 * 服务列表:
 * 1. graphql服务;
 * 2. statics静态资源服务；
 *
 */

import fs from 'fs';
import path from 'path';

import { application as App, } from './core/index.mjs';
import * as m from './middlewares/index.mjs';
import server from './http2.mjs';
import reactApp from '../client/serverRender.mjs';

// apis
import { graphql, reactDOM, wdm, } from './apis/index.mjs';


// 优先使用production模式
process.env.NODE_ENV = process.env.NODE_ENV || 'production'; 

// 设置__dirname
const __dirname = path.dirname(import.meta.url).substr(7); 
const APP_PATH = path.dirname(path.dirname(__dirname));
const PackageJSON = JSON.parse(fs.readFileSync(path.join(APP_PATH, 'package.json')));
const isDevel = process.env.NODE_ENV === 'development';

// 实例化服务程序
const app = new App();
app.server = server;

// 加载配置 @todo：再第一次运行时进行配置，并保存到用户配置目录中
const configPath = path.join(process.env.HOME, `.${PackageJSON.name}`)
const configFile = path.join(configPath, 'config.json');
const config = JSON.parse(fs.readFileSync(configFile, 'utf8')); 

// 配置服务中间件
app.use(m.error(configPath));              // 捕获中间件错误
app.use(m.xResponse());          // 记录响应时间
app.use(m.cookies());            // 支持cookie读写
app.use(m.log(configPath));                // 记录log
app.use(m.cors());               // 跨域访问响应
app.use(m.mongodb(config.mongodb)); // mongo数据库

// @todo: 取代route中间件
app.use((ctx, next) => {
  next();
});

// 配置路由
const routes = [];

routes.push({ 
		path: /^\/api\/graphql$/i, 
		api: graphql({
				schemaPath: path.join(APP_PATH, 'src', 'schema'),
				resolversPath: path.join(APP_PATH, 'src', 'resolvers'),
		}), 
		method: ['POST', isDevel && 'GET'].filter(Boolean) // 仅在开发模式下支持GET请求
});

if (process.env.DEVEL) {
  routes.push({ path: /^\//, api: wdm(), method: 'GET' });
} else {
  routes.push({ 
    path: /^\//, 
    api: m.statics(path.join(process.env.HOME, 'public_html', 'dist')), 
    method: 'GET' 
  });
}

//routes.push({ path: /^\//, api: reactDOM(reactApp), method: 'GET', });

app.use(m.router(routes));

// 开启监听
app.listen({
  port: Number.parseInt(process.env.PORT, 10) || 3000,
  host: process.env.HOST || '::', 
  exclusive: false,
  ipv6Only: false,
});
