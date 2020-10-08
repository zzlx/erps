/**
 * *****************************************************************************
 *
 * API路由
 *
 * 提供API服务
 *
 *
 * *****************************************************************************
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
import Router from '../koas/Router.mjs';
import settings from '../config/settings.mjs';

const debug = util.debuglog('debug:api');
const api = new Router({});
const paths = settings.paths;

api.all('/', async (ctx, next) => {

  //if (ctx.pathname === 'favicon.ico') return await next();

  const apiFile = path.join(paths.API, path.relative('/api', ctx.pathname) + '.mjs');
  debug(apiFile);

  if (fs.existsSync(apiFile)) {
    return await import(apiFile).then(m => {
      const api = m.default;
      api(ctx);
    });
  }

  ctx.body = 'api';
});

export default api;
