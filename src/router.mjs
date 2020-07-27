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
import Router from '../src/koas/Router.mjs';

const __filename = import.meta.url.substr(7);
const __dirname  = path.dirname(__filename);
const SRC_PATH   = __dirname;
const API_PATH   = path.join(SRC_PATH, 'api');
const debug = util.debuglog('debug:routes'); // debug function

const index = new Router(); // router

index.get('/', (ctx, next) => {
  // ctx.router available
  ctx.body = 'test';
});

index.post('/homePage', async (ctx, next) => {
  // ctx.router available

  ctx.body = await ctx.getRawBody();

});

index.get('/homePage', (ctx, next) => {
  console.log(ctx.stream);
  // ctx.router available
  ctx.body = 'HomePage';
});

index.get('/homePage/:module', (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage-module';
  console.log(ctx);
});

const api = new Router();


export default index;
