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
import Router from './koas/Router.mjs';

const __filename = import.meta.url.substr(7);
const __dirname  = path.dirname(__filename);
const SRC_PATH   = __dirname;
const API_PATH   = path.join(SRC_PATH, 'api');
const debug = util.debuglog('debug:routes'); // debug function

const r = new Router({
  methods: [ 'GET', 'HEAD', 'OPTIONS', 'POST', ],
}); // router

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

// read src/api path
const apiPath = path.join('');

r.post('/api/graphql', (ctx, next) => {
  ctx.body = 'graphql-api';
});

r.get('/api/graphql', (ctx, next) => {
  ctx.body = 'graphql-api';
});

export default r;
