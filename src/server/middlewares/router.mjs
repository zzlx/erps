/**
 * Router middleware
 *
 * @param {array} routes
 * @return {function} middleware function
 * @api public
 */

export default (routes) => {
  if (!Array.isArray(routes)) {
    throw new TypeError('Confituration Error: Routes options must be an array.');
  }

  return function routerMiddleware (ctx, next) {
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
