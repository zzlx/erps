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
import reactApp from '../client/serverRender.mjs';
import webpackConfig from '../config.webpack.cjs';

// apis
import { graphql, reactDOM, statics, wdm, } from './apis/index.mjs';

// 设置__dirname
const __dirname = path.dirname(import.meta.url).substr(7); 
const APP_PATH = path.dirname(path.dirname(__dirname));
const isDevel = process.env.NODE_ENV === 'development';
const webpackConf = webpackConfig();


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
  routes.push({ path: /^\//, api: wdm(webpackConf), method: 'GET' });
} else {
  routes.push({ 
    path: /^\//, 
    api: statics(webpackConf.output.path), 
    method: 'GET' 
  });
}

export default routes;
