/**
 * 服务端路由
 *
 * @param {array} routes
 * @return {function} middleware function
 * @api public
 */

import fs from 'fs';
import path from 'path';
import util from 'util';
const debug = util.debuglog('debug:router');

export default (servicePath, prefix) => {
  const routeCache = Object.create(null); // 路由缓存

  return async function apisRouterMiddleware (ctx, next) {
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
