/**
 * *****************************************************************************
 *
 * 路由中间件
 *
 * RESTful resource routing middleware
 *
 * @param {array} routes
 *@return {function} middleware function
 * @api public
 *
 * @file router.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import util from 'util';

import compose from '../kernel/compose.mjs';

const debug = util.debuglog('debug:router-middleware');
const methods = http.METHODS.map(method => method.toLowerCase());

export default function router (servicePath, prefix) {
  const routeCache = Object.create(null); // 路由缓存

  return async function routerMiddleware (ctx, next) {

    if (!routeCache['/']) {
      const serviceModule = path.join(servicePath, 'index.mjs'); 

      debug(serviceModule);
      routeCache['/'] = await import(serviceModule).then(m => m.default);
    }

    if (!routeCache[ctx.pathname])  {
      const serviceModule = path.join(servicePath, ctx.pathname + '.mjs'); 
      if (fs.existsSync(serviceModule)) {
        routeCache[ctx.pathname] = await import(serviceModule).then(m => m.default);
      }
    }

    // 获取service
    const service = routeCache[ctx.pathname] || routeCache['/'];
    if (null == service) return next();
    return await service.apply(null, [ctx, next])
  }
}
