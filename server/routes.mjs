/**
 * *****************************************************************************
 *
 * 服务器端路由配置
 *
 *
 * 路由
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import ReactDOMServer from 'react-dom/server.js';

import dba from './koa/middlewares/dba.mjs';
import statics from './koa/middlewares/statics.mjs';
import serverRender from './koa/middlewares/serverRender.mjs';

import Router from './koa/Router.mjs';
import config from './config.mjs';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 
const paths = config.paths;

const index = new Router(); // index router

const s = new Router({
  methods: ['GET'],
  prefix: '',
});

const graphql = new Router({ 
  //prefix: '/api'
});

graphql.use(dba(config));

graphql.all('graphql', '/graphql', async (ctx, next) => {
  //ctx.body = await ctx.getRawBody();
  //debug(ctx.params);
  //debug('ctx._matchedRoute', ctx._matchedRoute);
  //debug(ctx.router.url('graphql', 'tttt'));
  ctx.body = 'graphql';
});

index.use('/api', graphql.routes(), graphql.allowedMethods());
index.get('/*', statics(paths.public));
index.all('/*', serverRender());

export default index;
