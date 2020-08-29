/**
 * *****************************************************************************
 *
 * 服务器端路由配置
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import ReactDOMServer from 'react-dom/server.js';

import dba from '../koa/middlewares/dba.mjs';
import statics from '../koa/middlewares/statics.mjs';
import serverRender from '../koa/middlewares/serverRender.mjs';

import Router from '../koa/Router.mjs';
import config from '../config/default.mjs';
import { date } from '../utils.mjs'; // @todo: 

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 
const paths = config.paths;

const graphql = new Router({});

graphql.use(dba(config));

graphql.all('graphql', '/graphql', async (ctx, next) => {
  //ctx.body = await ctx.getRawBody();
  //debug(ctx.params);
  //debug('ctx._matchedRoute', ctx._matchedRoute);
  //debug(ctx.router.url('graphql', 'tttt'));
  ctx.body = 'graphql';
});

// 定义主路由
const Index = new Router();

Index.use('/api', graphql.routes(), graphql.allowedMethods());

Index.get('/test', (ctx, next) => {
  //ctx.body = fs.readDirSync()
  ctx.body = 'test1';

});

Index.get('/system/log', (ctx, next) => {
  const logFile = path.join(paths.logPath, date.format('yyyymmdd') + '.log');

  // @todos: 需要完善显示页面
  ctx.type = 'text';
  ctx.body = fs.createReadStream(logFile);
});

Index.all('/*', serverRender());
Index.get('/*', statics(paths.public));

export default Index;
