/**
 * API middleware
 *
 * @param {array} routes
 * @return {function} middleware function
 * @api public
 */

import fs from 'fs';
import path from 'path';

export default (api_path) => {
  let apiPath = null; 

  if (api_path == null) apiPath = path.join(process.cwd(), 'apis');

  if (api_path && 'string' === typeof api_path) {
    if (path.isAbsolute(api_path)) apiPath = api_path;
    else apiPath = path.join(process.cwd(), api_path);
  }

  if (!fs.existsSync(apiPath)) {
    throw new Error('The path is not exists.');
  }


  return function apiMiddleware (ctx, next) {
    for (let route of routes) {
      if (Array.isArray(route.method)) {
        if (route.method.indexOf(ctx.method) === -1) continue;
      }

      if ('string' === typeof route.method) {
        if (ctx.method !== route.method && 'ANY' !== route.method) continue;
      }

      if (!route.path.test(ctx.pathname)) continue;

      const api = route['api'];

      const fn = api.middlewares ? ctx.app.compose(api.middlewares) : api; 

      return fn.apply(null, [ctx, next]);
    }

    return next();
  }
}
