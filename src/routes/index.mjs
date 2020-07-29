/**
 * *****************************************************************************
 *
 * 服务路由配置
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';

import sass from '../utils/sass.mjs';

import Test from '../views/Test.mjs';

import Router from '../kos/Router.mjs';
import config from '../config.js';

const __filename = import.meta.url.substr(7);
const debug = util.debuglog(`debug:${path.basename(__filename)}`); 

const index = new Router(); // router

index.get('/', (ctx, next) => {
  // ctx.router available
  ctx.body = ctx.ReactDOMServer.renderToString(Test);
});

index.get('/styles.css', async (ctx, next) => {
  ctx.type = 'css'

  const data = await sass({
    file: config.paths.scssEntryPoint,
    outputStyle: ctx.app.env === 'production' ? 'compressed': 'nested',
  });

  ctx.body = data.css.toString('utf8');
});

index.get('/homePage', (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage';
});

index.get('/homePage/:module', (ctx, next) => {
  next();
}, (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage-module';
});

const api = new Router({ 
  //prefix: '/api'
  
}).post('graphql', '/graphql/:state', async (ctx, next) => {
  ctx.body = await ctx.getRawBody();

}).get('graphql', '/graphql/:state', async (ctx, next) => {

  debug(ctx.params);
  debug('ctx._matchedRoute', ctx._matchedRoute);
  debug(ctx.router.url('graphql', 'tttt'));
  ctx.body = 'graphql';
});

index.use('/api', api.routes(), api.allowedMethods());

export default index;
