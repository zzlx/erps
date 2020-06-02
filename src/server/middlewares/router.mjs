/**
 * *****************************************************************************
 *
 * 路由中间件
 *
 * RESTful resource routing middleware
 *
 * @param {array} routes
 * @return {function} middleware function
 * @api public
 *
 * @file router.mjs
 * *****************************************************************************
 */

import fs from 'fs';
import http from 'http';
import path from 'path';
import util from 'util';

const debug = util.debuglog('debug:middleware.router');

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

const methods = [
  'HEAD',
  'OPTIONS',
  'GET',
  'PUT',
  'PATCH',
  'POST',
  'DELETE'
];

class Router {
  constructor (props) {
    this.props = props;
    this.params = {};
    this.stack  = [];
  }


  /**
   *
   */

  prefix (prefix) {
    prefix = prefix.replace(/\/$/, '');
    for (let i = 0; i < this.stack.length; i++) {
      const route = this.stack[i];
      route.setPrefix(prefix);
    }
    return this;
  }

  /**
   * Generate URL from url pattern and given `params`.
   *
   * # example
   *
   * ```javascript
   * const url = Router.url('/users/:id', {id: 1});
   * // => "/users/1"
   * ```
   *
   * @param {String} path url pattern
   * @param {Object} params url parameters
   * @returns {String}
   */

  url (path) {
    const args = Array.prototype.slice.call(arguments, 1);
    return Layer.prototype.url.apply({ path: path }, args);
  }

}

for (let i = 0; i < methods.length; i++) {
  const method = methods[i];
  Router.prototype[method] = function (name, path, middleware) {
    if (typeof path === "string" || path instanceof RegExp) {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }
  }
}
