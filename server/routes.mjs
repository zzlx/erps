/**
 * *****************************************************************************
 *
 * 服务路由配置
 *
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import ReactDOMServer from 'react-dom/server.js';

import dba from './koa/middlewares/dba.mjs';
import statics from './koa/middlewares/statics.mjs';
import sass from './utils/sass.mjs';

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

const api = new Router({ 
  //prefix: '/api'
  
});

api.use('/', dba(config));

api.post('/graphql', '/graphql/:state', async (ctx, next) => {
  ctx.body = await ctx.getRawBody();

}).get('/graphql', '/graphql/:state', async (ctx, next) => {

  debug(ctx.params);
  debug('ctx._matchedRoute', ctx._matchedRoute);
  debug(ctx.router.url('graphql', 'tttt'));
  ctx.body = 'graphql';
});

//index.use('/', statics(paths.public));
//index.use('/api', api.routes(), api.allowedMethods());
//index.use('/statics', statics.routes(), statics.allowedMethods());
//index.use('/modules', modules.routes(), modules.allowedMethods());

index.get('/*', statics(paths.public));

export default index;
