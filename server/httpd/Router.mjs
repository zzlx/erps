/**
 * *****************************************************************************
 * 
 * Router
 * 
 * ```javascript
 *
 * const app = new Koa();
 * const router = new Router();
 * router.get('/', (ctx, next) => {
 *   // ctx.router available
 * });
 *
 * app
 *   .use(router.routes())
 *   .use(router.allowedMethods());
 * ```
 *
 * @param {object} opts
 * @param {string} opts.prefix
 *
 * *****************************************************************************
 */

import { assert, path, pathToRegexp } from '../utils.lib.mjs';
import HttpError from '../HttpError.mjs';
import compose from './compose.mjs';
import Route from './Route.mjs';

export default class Router {
  constructor (opts = {}) {
    this.opts = Object.assign({
      prefix: null,
      methods: [ 'HEAD', 'GET', 'OPTIONS', 'POST' ],
    }, opts);

    if (Array.isArray(this.opts.methods)) this.methods = this.opts.methods;
    if (typeof this.opts.methods === 'string') this.methods = [this.opts.methods];

    this.stack  = []; // route stacks
    this.params = {};

    this.addMethods();
  }

  /**
   * Generate URL from url pattern and given `params`.
   *
   * 静态方法
   * API Reference: Router.url(path, params) ⇒ String
   *
   * # example
   *
   * ```javascript
   * const url = Router.url('/users/:id', {id: 1}); // => "/users/1"
   * ```
   *
   * @param {String} path url pattern
   * @param {Object} params url parameters
   * @returns {String}
   *
   */

  static url (path) {
    const args = Array.prototype.slice.call(arguments, 1);
    return Layer.prototype.url.apply({ path: path }, args);
  }

  /**
   * Register route with all methods
   *
   * @param {string} name optional
   * @param {string} path
   * @param {function} middleware support multiple middlewares
   * @param {function} callback
   * @returns {Router}
   */

  all (name, path, middleware) {
    if (typeof path === 'string') {
      middleware = Array.prototype.slice.call(arguments, 2);
    } else {
      middleware = Array.prototype.slice.call(arguments, 1);
      path = name;
      name = null;
    }

    this.register(path, this.methods, middleware, { name: name });

    return this;
  }

  /**
   * Register route with method
   *
   * @return {object} Router this.get|put|post|head|options ⇒ Router
   */

  addMethods () {
    const router = this;

    for (const method of this.methods) {
      router[method.toLowerCase()] = function routerMethod (name, path, middleware) {
        if (typeof path === "string" || path instanceof RegExp) {
          middleware = Array.prototype.slice.call(arguments, 2);
        } else {
          middleware = Array.prototype.slice.call(arguments, 1);
          path = name;
          name = null;
        }

        router.register(path, [ method ], middleware, { name: name });

        return router;
      }

    }

  }

  /**
   * Run middleware for named route parameters. 
   * useful for auto-loading or validation
   *
   * API Reference: this.param(param, middleware) ⇒ Router
   *
   * @param {string} param
   * @param {function} middleware
   * @returns {Router}
   */

  param (param, middleware) {
    this.params[param] = middleware;
    for (const route of this.stack) route.param(param, middleware);
    return this;
  }

  /**
   * Lookup route with given name.
   *
   * Usage:
   * router.route(routeName);  => namedRoute
   *
   * @param {string} name
   * @returns {Layer|false}
   */

  route (routeName) {
    for (const route of this.stack) {
      if (route.name && route.name === routeName) return route;
    }

    return null;
  }

  /**
   * Generate URL for route. 
   *
   * Takes a route name and map of named params
   *
   * API Reference: this.url(name, params, [options]) ⇒ String | Error
   *
   * @param {string} name route name
   * @param {object} params url parameters
   * @param {object} [options]
   * @param {object|string} [options.query] query options
   * @returns {string|error}
   */

  url (name, params) {
    const route = this.route(name);
    if (route == null) throw new Error(`No route found for name: ${name}`);

    if (route) {
      const args = Array.prototype.slice.call(arguments, 1);
      return route.url(args);
    }
  }

  /**
   * Set the path prefix for a Router instance that was already initialized.
   *
   * .prefix(prefix) ⇒ Router
   *
   * Example:
   *
   *  ```javascript
   * router.prefix('/things/:thing_id')
   * ```
   *
   * @param {String} prefix
   * @returns {Router}
   */

  prefix (prefix) {
    assert(typeof prefix === 'string', 'prefix paramater must be string.');

    prefix = stripTrailingSlash(prefix); // strip trailing slash
    this.opts.prefix = prefix;
    for (let route of this.stack) route.setPrefix(prefix);
    return this;
  }

  /**
   * Use middleware
   *
   * .use([path], middleware) ⇒ Router
   *
   * @param {String} path
   * @param {Function} middleware
   * @returns {Router}
   */

  use () {
    const middleware = Array.prototype.slice.call(arguments);
    let path;

    // support array of paths 
    if (Array.isArray(middleware[0]) && typeof middleware[0][0] === 'string') {
      for (const p of middleware[0]) {
        this.use.apply(this, [p].concat(middleware.slice(1)));
      }
      return this;
    }

    const hasPath = typeof middleware[0] === 'string';
    if (hasPath) path = middleware.shift();

    // iterator middleware arguments
    for (const m of middleware) {

      if (m.router) {
        const cloneRouter = new Router(m.router.opts);
        cloneRouter.stack = m.router.stack;
        cloneRouter.params = m.router.params;

        for (let j = 0; j < cloneRouter.stack.length; j++) {
          const nestedLayer = cloneRouter.stack[j];
          const cloneLayer = new Route(
            nestedLayer.path, 
            nestedLayer.methods, 
            nestedLayer.stack,
            nestedLayer.opts,
          );

          if (path) cloneLayer.setPrefix(path);
          if (this.opts.prefix) cloneLayer.setPrefix(this.opts.prefix);
          this.stack.push(cloneLayer);
          cloneRouter.stack[j] = cloneLayer;
        }

        for (const k of Object.keys(this.params)) cloneRouter.param(k, this.params[k]);

      } else {
        const keys = [];
        pathToRegexp(this.opts.prefix || '', keys);
        const routerPrefixHasParam = this.opts.prefix && keys.length;

        this.register(path || '([^\/]*)', [], m, {
          end: false, 
          ignoreCaptures: !hasPath && !routerPrefixHasParam
        });
      }
    }

    return this;
  }

  /**
   * Return router middleware which dispatches a route matching the request.
   *
   * @returns {Function}
   */

  routes () {
    const routerMiddleware =  (ctx, next) => {
      const path = this.opts.routerPath || ctx.routerPath || ctx.pathname;
      const matched = this.match(path, ctx.method);

      let layerChain; // route layer chain

      if (ctx.matched) ctx.matched.push(...matched.path);
      else ctx.matched = matched.path;

      ctx.router = this;

      if (!matched.route) return next();

      const matchedLayers = matched.pathAndMethod; /// matched

      // most specific layer
      const mostSpecificLayer = matchedLayers[matchedLayers.length - 1];

      ctx._matchedRoute = mostSpecificLayer.path;

      if (mostSpecificLayer.name) ctx._matchedRouteName = mostSpecificLayer.name;

      layerChain = matchedLayers.reduce((memo, layer) => {
        memo.push((ctx, next) => {
          ctx.captures = layer.captures(path, ctx.captures);
          ctx.params = layer.params(path, ctx.captures, ctx.params);
          ctx.routerName = layer.name;
          return next();
        });

        return memo.concat(layer.stack);
      }, []);

      return compose(layerChain)(ctx, next);
    }

    routerMiddleware.router = this;

    return routerMiddleware;
  }

  /**
   *
   * Returns separate middleware for responding to `OPTIONS` requests 
   *
   * API Reference: .allowedMethods([options]) ⇒ function
   *
   * with an `Allow` header containing the allowed methods, 
   * as well as responding with `405 Method Not Allowed` 
   * and `501 Not Implemented` as appropriate.
   *
   * @param {Object=} options
   * @param {Boolean=} options.throw throw error instead of setting status and header
   * @param {Function=} options.notImplemented throw the returned value in place of the default NotImplemented error
   * @param {Function=} options.methodNotAllowed throw the returned value in place of the default MethodNotAllowed error
   * @returns {Function}
   */

  allowedMethods (options = {}) {
    const implemented = this.methods;

    return function allowedMethodsMiddleware(ctx, next) {
      const allowed = {};

      if (!ctx.status || ctx.status === 404) {

        for (let route of ctx.matched) {
          for (let method of route.methods) allowed[method] = method;
        }

        const allowedArr = Object.keys(allowed);

        if (!~implemented.indexOf(ctx.method)) {
          if (options.throw) {
            let notImplemented = typeof options.methodNotImplemented === 'function'
              ? options.methodNotImplemented()
              : new HttpError(http2.constants.HTTP_STATUS_NOT_IMPLEMENTED);

            throw notImplemented;
          } else {
            ctx.status = http2.constants.HTTP_STATUS_NOT_IMPLEMENTED;
            ctx.set('Allow', allowedArr.join(', '));
          }

        } else if (allowedArr.length) {

          if (ctx.method === 'OPTIONS') {
            ctx.status = http2.constants.HTTP_STATUS_OK;
            ctx.body = '';
            ctx.set('Allow', allowedArr.join(', '));

          }

          if (!allowed[ctx.method]) {
            if (options.throw) {
              let notAllowed = typeof options.methodNotAllowed === 'function'
                ? options.methodNotAllowed()
                : new HttpError(http2.constants.HTTP_STATUS_METHOD_NOT_ALLOWED);
              throw notAllowed;
            } else {
              ctx.status = http2.constants.HTTP_STATUS_METHOD_NOT_ALLOWED
              ctx.set('Allow', allowedArr.join(', '));
            }
          }
        }
      }

      return next(); // 
    }
  }


  /**
   * Redirect source to destination URL with optional 3xx status code.
   *
   * @param {string} source URL or route name.
   * @param {string} destination URL or route name.
   * @param {number} code Http status code(default: 301 moved permanently)
   * @return {Router}
   */

  redirect (source, destination, code = 301) {
    // lookup source route by name
    if (source[0] !== '/') source = this.url(source);

    // lookup destination route by name
    if (destination[0] !== '/') destination = this.url(destination);

    return this.all(source, ctx => {
      ctx.redirect(destination); // 重定向
      ctx.status = code;
    });
  }

  /**
   *
   * Create and register a route.
   *
   * @param {string} path
   * @param {array} methods
   * @param  {function} middleware
   * @returns {Layer}
   * @private
   */

  register (path, methods, middleware, opts = {}) {

    if (Array.isArray(path)) {
      for (let curPath of path) this.register(curPath, methods, middleware, opts);
      return this;
    }

    const route = new Route(path, methods, middleware, {
      end: opts.end === false ? opts.end : true,
      name: opts.name,
      sensitive: opts.sensitive || false,
      strict: opts.strict || false,
      prefix: opts.prefix || "",
      ignoreCaptures: opts.ignoreCaptures,
    });

    if (this.opts.prefix) route.setPrefix(this.prefix);
    for (const k of Object.keys(this.params)) route.param(k, this.params[k]);

    this.stack.push(route);

    return route;
  }

  /**
   *
   * Match given path and return corresponding routes
   *
   *
   * @param {string} path
   * @param {string} method
   * @returns {Object.<path, pathAndMethod> returns layers that matched path and method
   * @private
   */

  match (path, method) {
    const matched = {
      path: [],
      pathAndMethod: [],
      route: false,
    };

    const layers = this.stack;

    for (const layer of layers) {
      if (layer.match(path)) {
        matched.path.push(layer);

        if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
          matched.pathAndMethod.push(layer);
          if (layer.methods.length) matched.route = true;
        }
      }
    }

    return matched;
  }
}
