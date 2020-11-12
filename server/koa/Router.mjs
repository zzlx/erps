/**
 * *****************************************************************************
 * 
 * 
 *
 * *****************************************************************************
 */

import util from 'util';
import compose from './compose.mjs';
import HttpError from './HttpError.mjs';
import { 
  assert, 
  compile, 
  parse, 
  path,
  pathToRegexp, 
} from '../utils.lib.mjs';

const debug = util.debuglog('debug:router.mjs');

export default class Router {
  /**
   * constructor
   *
   * @param {object} props
   * @param {string} props.prefix
   * @param {array}  props.methods
   * @param {object} props.params
   */

  constructor (opts = {}) {
    this.opts = Object.assign({}, {
      methods: [ 'GET', 'HEAD', 'OPTIONS', 'POST' ],
    }, opts);

    this.methods = this.opts.methods;
    this.params = {};
    this.stack  = [];

    // this.get|put|post|patch|delete|del ⇒ Router
    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i].toLowerCase().replace('-', '_');

      this[method] = function (name, path, middleware) {

        if (typeof path === "string" || path instanceof RegExp) {
          middleware = Array.prototype.slice.call(arguments, 2);
        } else {
          middleware = Array.prototype.slice.call(arguments, 1);
          path = name;
          name = null;
        }

        this.register(path, [method], middleware, { name: name });

        return this;
      }
    }
  }

  /**
   * Run middleware for named route parameters. 
   * useful for auto-loading or validation
   *
   * @param {string} param
   * @param {function} middleware
   * @returns {Router}
   */

  param (param, middleware) {
    this.params[param] = middleware;
    for (let route of this.stack) route.param(param, middleware);
    return this;
  }

  /**
   * Register route with all methods
   *
   * @param {string} name optional
   * @param {string} path
   * @param {function} middleware support multiple middlewares
   * @param {function} callback
   * @returns {Router}
   * @private
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
   * Lookup route with given name.
   *
   * Usage:
   * router.route(routeName);  => namedRoute
   *
   * @param {string} name
   * @returns {Layer|false}
   */

  route (routeName) {
    for (let route of this.stack) {
      if (route.name && route.name === routeName) return route;
    }

    return false;
  }

  /**
   * Generate URL for route. 
   *
   * Takes a route name and map of named params
   *
   *
   * @param {string} name route name
   * @param {object} params url parameters
   * @param {object} [options]
   * @param {object|string} [options.query] query options
   * @returns {string|error}
   */

  url (name, params) {
    const route = this.route(name);
    assert(route, `No route found for name: ${name}`);

    if (route) {
      const args = Array.prototype.slice.call(arguments, 1);
      return route.url.apply(route, args);
    }
  }

  /**
   * Set the path prefix for a Router instance
   *
   * Example:
   * router.prefix('/users')
   * router.get('/:id', ...)  => "/users/:id"
   *
   * @param {String} prefix
   * @returns {Router}
   */

  prefix (prefix) {
    assert(typeof prefix === 'string', 'prefix paramater must be string.');
    prefix = stripTrailingSlash(prefix);
    this.opts.prefix = prefix;
    for (let route of this.stack) route.setPrefix(prefix);
    return this;
  }
}

/**
 * Use middleware
 *
 * @param {String=} path
 * @param {Function} middleware
 * @param {Function=} ...
 *
 * @returns {Router}
 */

Router.prototype.use = function () {
  const router = this;
  let path = 'string' === arguments[0] ? arguments[0] : null;

  const middlewares = 'string' === typeof arguments[0]
    ? Array.prototype.slice.call(arguments, 1)
    : Array.prototype.slice.call(arguments);

  // support paths 
  if (Array.isArray(path)) {
    for (let p of path) this.use.apply(this, [p].concat(middlewares.slice(1)));
    return this;
  }

  // iterator middleware arguments
  for (let m of middlewares) {
    if (m.router) {
      const cloneRouter = Object.assign(Object.create(Router.prototype), m.router, {
        stack: m.router.stack.slice(0) 
      });

      for (let j = 0; j < cloneRouter.stack.length; j++) {
        const nestedLayer = cloneRouter.stack[j]; // nested layer
        const cloneLayer = Object.assign(Object.create(Layer.prototype), nestedLayer);

        // layer添加前缀
        if (path) cloneLayer.setPrefix(path);
        if (router.opts.prefix) cloneLayer.setPrefix(router.opts.prefix);

        router.stack.push(cloneLayer);
        cloneRouter.stack[j] = cloneLayer;
      } // end of for j

      if (router.params) {
        const routerParams = Object.keys(router.params);
        for (let key of routerParams) cloneRouter.param(key, router.params[key]);
      }
    } else {
      const keys = [];
      pathToRegexp(router.opts.prefix || '', keys);
      const routerPrefixHasParam = router.opts.prefix && keys.length;

      router.register(path || '(.*)', [], m, {
        end: false, 
        ignoreCaptures: !hasPath && !routerPrefixHasParam
      });
    } 

  } // end of for

  return this;
}

/**
 *
 * Return router middleware which dispatches a route matching the request.
 *
 * @returns {Function}
 */

Router.prototype.routes = function () {
  const router = this;

  async function routerMiddleware (ctx, next) {

    const path = router.opts.routerPath || ctx.routerPath || ctx.pathname;
    const matched = router.match(path, ctx.method);

    let layerChain;

    if (ctx.matched) {
      ctx.matched.push.apply(ctx.matched, matched.path);
    } else {
      ctx.matched = matched.path;
    }

    ctx.router = router;

    if (!matched.route) return next();

    const matchedLayers = matched.pathAndMethod;

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

    await compose(layerChain)(ctx);

    return await next();
  }

  routerMiddleware.router = this;

  return routerMiddleware;
}

/**
 *
 * Returns separate middleware for responding to `OPTIONS` requests 
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

Router.prototype.allowedMethods = function (options = {}) {
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

Router.prototype.redirect = function (source, destination, code = 301) {
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

Router.prototype.register = function (path, methods, middleware, opts = {}) {

  if (Array.isArray(path)) {
    for (let curPath of path) this.register(curPath, methods, middleware, opts);
    return this;
  }

  // route
  const route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures,
  });

  if (this.opts.prefix) route.setPrefix(this.opts.prefix);

  // add parameter middleware
  for (let p of Object.keys(this.params)) route.param(p, this.params[p]);

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

Router.prototype.match = function (path, method) {
  const layers = this.stack;

  const matched = {
    path: [],
    pathAndMethod: [],
    route: false,
  };

  for (let layer of layers) {
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

/**
 *
 * Generate URL from url pattern and given `params`.
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

Router.url = function (path) {
  const args = Array.prototype.slice.call(arguments, 1);
  return Layer.prototype.url.apply({ path: path }, args);
}

/**
 * Route layer
 * @TODO: Layer -> 改名为 Route
 */

class Layer {
  /**
   * Initialize a new routing Layer with given `method`, `path`, and `middleware`.
   *
   * @param {String|RegExp} path Path string or regular expression.
   * @param {Array} methods Array of HTTP verbs.
   * @param {Array} middleware Layer callback/middleware or series of.
   * @param {Object=} opts
   * @param {String=} opts.name route name
   * @param {String=} opts.sensitive case sensitive (default: false)
   * @param {String=} opts.strict require the trailing slash (default: false)
   * @returns {Layer}
   * @private
   */
  constructor (path, methods, middleware, opts = {}) {
    this.opts = Object.assign({}, opts);
    this.name = this.opts.name || null;
    this.methods = []; // 方法
    this.paramNames = []; // 参数
    this.stack = Array.isArray(middleware) ? middleware : [middleware];

    for (let method of methods) {
      const len = this.methods.push(method.toUpperCase());
      if (this.methods[len-1] === 'GET') this.methods.unshift('HEAD');
    }

    for (let fn of this.stack) {
      assert(typeof fn === 'function', `${fn} must be a function.`);
    }

    this.path = path;
    
    this.regexp = pathToRegexp(path, this.paramNames, this.opts);
  }

  /**
   * Prefix route path.
   *
   * @param {String} prefix
   * @returns {Layer}
   * @private
   */

  setPrefix (prefix) {
    if (this.path) {
      this.path = this.path !== '/' || this.opts.strict === true
        ? `${prefix}${this.path}` 
        : prefix;

      this.paramNames = []; // reset this.paramNames
      this.regexp = pathToRegexp(this.path, this.paramNames, this.opts);
    }

    return this; // return route
  }

  /**
   * Returns map of URL parameters for given `path` and `paramNames`.
   *
   * @param {String} path
   * @param {Array.<String>} captures
   * @param {Object=} existingParams
   * @returns {Object}
   * @private
   */

  params (path, captures, existingParams) {
    const params = existingParams || {};

    for (let i = 0; i < captures.length; i++) {
      if (this.paramNames[i]) {
        const cap = captures[i];
        params[this.paramNames[i].name] = cap ? decodeURIComponent(cap) : cap;
      }
    }

    return params;
  }

  /**
   *
   * Run validations on route named parameters
   *
   * @example
   *
   * ```javascript
   * router
   *   .param('user', function (id, ctx, next) {
   *     ctx.user = users[id];
   *     if (!user) return ctx.status = 404;
   *     next();
   *   })
   *   .get('/users/:user', function (ctx, next) {
   *     ctx.body = ctx.user;
   *   });
   * ```
   *
   * @param {string} param
   * @param {function} middleware
   * @returns {Layer}
   * @private
   */

  param (param, fn) {
    const stack = this.stack;
    const params = this.paramNames;

    const middleware = function (ctx, next) {
      return fn.call(this, ctx.params[param], ctx, next);
    }

    middleware.param = param;

    const names = params.map(p => p.name);

    const x = names.indexOf(param);

    if (x > -1) {
      stack.some((fn, i) => {
        if (!fn.param || names.indexOf(fn.param) > x) {
          stack.splice(i, 0, middleware);
          return true;
        }
      });
    }

    return this;
  }

  /**
   * Returns whether request `path` matches route.
   *
   * @param {String} path
   * @returns {Boolean}
   * @private
   */

  match (path) {
    return this.regexp.test(path);
  }

  /**
   * Returns array of regexp url path captures.
   *
   * @param {String} path
   * @returns {Array.<String>}
   * @private
   */

  captures (path) {
    return this.opts.ignoreCaptures ? [] : path.match(this.regexp).slice(1);
  }

  /**
   * Generate URL for route using given `params`.
   *
   * ```javascript
   * const route = new Layer('/users/:id', ['GET'], fn);
   * route.url({ id: 123 }); // => "/users/123"
   * ```
   * @param {Object} params url parameters
   * @returns {String} url string
   * @private
   *
   */

  url (params, options) {
    let args = params;
    let replace = {};

    if (typeof params !== 'object') {
      args = Array.prototype.slice.call(arguments);

      if (typeof args[args.length - 1] === 'object') {
        options = args[args.length -1];
        args = args.slice(0, args.length -1);
      }
    }

    const url = this.path.replace(/\(\.\*\)/g, '');
    const tokens = parse(url);

    if (Array.isArray(args)) {
      let j = 0;
      for (let token of tokens) {
        if (token.name) replace[token.name] = args[j++];
      }
    } else if (tokens.some(token => token.name)) {
      replace = params;
    } else {
      options = params;
    }

    const toPath = compile(url, options);

    let replaced = toPath(replace);

    if (options && options.query) {
      replaced = new URL(replaced);

      if (typeof options.query === 'string') {
        replaced.search = options.query;
      } else {
        replaced.search = undefined;
      }

      return replaced.href;
    }

    return replaced;
  }
}
