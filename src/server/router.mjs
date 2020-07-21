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
import Router from './kernel/Router.mjs';

const debug = util.debuglog('debug:routes'); // debug function

const router = new Router();

router.get('/', (ctx, next) => {
  // ctx.router available
  ctx.body = 'test';
});

router.get('/homePage\/?', (ctx, next) => {
  // ctx.router available
  ctx.body = 'HomePage';
});


export default router;
