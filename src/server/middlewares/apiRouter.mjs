/**
 * Router middleware
 *
 * @param {array} routes
 * @return {function} middleware function
 * @api public
 */

export default (apiPath) => {
  const apis = {};

  return function apisRouterMiddleware (ctx, next) {
    const api = apis[ctx.pathname];

    if (null == api) return next();
    return api.apply(null, [ctx, next])
  }
}
