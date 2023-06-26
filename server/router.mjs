/**
 * *****************************************************************************
 * 
 * 服务端路由配置
 *
 * @TODOS:
 *
 * * 解决子路由path问题
 * *
 * * ...
 *
 * *****************************************************************************
 */

import path from 'node:path';
import util from 'node:util';
import { Application } from './koa/Application.mjs';
import { Router } from './koa/Router.mjs';
import { cors, ssr, statics } from './middlewares/index.mjs';
import { readDir } from './utils/readDir.mjs';
import { objectID } from './utils/objectID.mjs';
import { paths } from './settings/paths.mjs'; 

const debug = util.debuglog('debug:server-router');

export const router = new Router({ }); // server router

router.get('Statics', '/*', statics(paths.PUBLIC_HTML, { index: 'index.html' }));

// APIs
const apis = await import('./api/index.mjs').then(m => m.default);
router.use('/api', cors(), apis.routes()); // API跨域访问

// Docs
const docsRouter = new Router({ });

docsRouter.get('Docs', '/*', statics(paths.DOCS, { index: 'README.md'})); 
router.use('/docs', docsRouter.routes());

// ssr
const appPath = path.join(paths.SERVER, 'app-frontend', 'App.mjs');
router.get('UI', ['/', '/*'], ssr({appPath: appPath}));

// Redirect /test to /
//router.redirect('/test', '/');

router.get('user', '/users/:id', (ctx, next) => {
  ctx.body = ctx.router.url('user', { id: 180 }, { query: 'test=abc'});
  return next();
});
