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
import Router from '../kos/Router.mjs';

const debug = util.debuglog('debug:routes'); // debug function

const r = new Router(); // router

r.get('/', (ctx, next) => {
  // ctx.router available
  ctx.body = 'test';
});

r.get('/homePage', (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage';
});

r.get('/homePage/:module', (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage-module';
  console.log(ctx);
});

r.post('/api/graphql', (ctx, next) => {
  ctx.body = 'graphql-api';
});

r.get('/api/graphql', (ctx, next) => {
  ctx.body = 'graphql-api';
});

export default r;
