import HttpError from './HttpError.mjs'; // @todo:

import { compile, parse, pathToRegexp, } from '../../utils/path-to-regexp.mjs';
import methods from '../../constants/http2-methods.json';

/**
 * *****************************************************************************
 *
 * Router
 *
 * RESTful resource routing manager.
 *
 *
 * *****************************************************************************
 */

export default class Router {

  /**
   * constructor
   *
   * @param {object} props
   * @param {string} props.prefix
   * @param {array} props.methods
   * @param {object} props.params
   *
   */

  constructor (props = {}) {
    this.opts = Object.assign({}, props);
    this.methods = this.opts.methods || methods;
    this.params = {};
    this.stack  = []; // stacks

     // this.get|put|post|patch|delete|del ⇒ Router
    for (let i = 0; i < this.methods.length; i++) {
      const method = this.methods[i].toLowerCase().replace('-', '_');

      // @todo: 完善name逻辑
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

    for (let i = 0; i < this.stack.length; i++) {
      const route = this.stack[i];
      route.param(param, middleware);
    }

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

    this.register(path, methods, middleware, { name });

    return this;
  }

  /**
   * Lookup route with given name.
   *
   * Usage:
   * router.route(namedRoute);  => namedRoute
   *
   * @param {string} name
   * @returns {Layer|false}
   */

  route (name) {
    const routes = this.stack;

    for (let i = 0; i < routes.length; i++) {
      if (routes[i].name && routes[i].name === name) return routes[i];
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

    if (route) {
      const args = Array.prototype.slice.call(arguments, 1);
      return route.url.apply(route, args);
    }

    return new Error(`No route found for name: ${name}`);
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
    if (typeof prefix !== 'string') {
      throw new Error('prefix paramater must be string.');
    }

    prefix = prefix.replace(/\/$/, '');

    this.opts.prefix = prefix;

    // stack layer
    for (let i = 0; i < this.stack.length; i++) {
      const layer = this.stack[i];
      layer.setPrefix(prefix);
    }

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
  const args = Array.prototype.slice.call(arguments);

  // paths 
  if (Array.isArray(arguments[0])) {
    let paths = arguments[0];

    for (let i = 0; i < paths.length; i++) {
      const path = paths[i];
      this.use.apply(this, [path].concat(args.slice(1)));
    }

    return this;
  }

  // path
  const hasPath = typeof arguments[0] === 'string';

  if (hashPath) path = args.shift(); 

  // iterator middleware arguments
  for (let i = 0; i < args.length; i++) {

    // get middleware
    const middleware = args[i];

    // whether router middleware
    if (middleware.router) {

      //
      const cloneRouter = Object.assign(
        Object.create(Router.prototype), 
        middleware.router, 
        { stack: middleware.router.stack.slice(0) }
      );

      // 
      for (let j = 0; j < cloneRouter.stack.length; j++) {
        const nestedLayer = cloneRouter.stack[j]; // nested layer
        const cloneLayer = Object.assign(
          Object.create(Layer.prototype),
          nestedLayer
        );

        // layer添加前缀
        if (path) cloneLayer.setPrefix(path);
        if (router.opts.prefix) cloneLayer.setPrefix(router.opts.prefix);

        router.stack.push(cloneLayer); // 
        cloneRouter.stack[j] = cloneLayer;

      } // end of for j

      if (router.params) {
        const routerParams = Object.keys(router.params);

        for (let k = 0; k < routerParams.length; k++) {
          const key = routerParams[k];
          cloneRouter.param(key, router.params[key]);
        } // end of for k
      }

    } else {
      router.register(path || '(.*)', [], middleware, {
        end: false, 
        ignoreCaptures: !hasPath
      });
    } 

  } // end of for

  return this;
}

/**
 *
 * Returns router middleware which dispatches a route matching the request.
 *
 * @returns {Function}
 */

Router.prototype.routes = function () {
  const router = this;
  
  function dispatch(ctx, next) {

    const path = router.opts.routerPath || ctx.routerPath || ctx.path;
    const matched = router.match(path, ctx.method);

    let layerChain; // 

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

    const compose = ctx.app.compose;
    return compose(layerChain)(ctx, next);
  }

  dispatch.router = this;

  return dispatch;
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

  return async function allowedMethods(ctx, next) {
    await next();

    const allowed = {};

    if (!ctx.status || ctx.status === 404) {

      for (let i = 0; i < ctx.matched.length; i++) {
        const route = ctx.matched[i];

        for (let j = 0; j < route.methods.length; j++) {
          const method = route.methods[j];
          allowed[method] = method;
        }

      } // end for matched

      const allowedArr = Object.keys(allowed);

      if (!~implemented.indexOf(ctx.method)) {
        if (options.throw) {
          let notImplementedThrowable = (typeof options.notImplemented === 'function')
            ? options.notImplemented()
            : new HttpError(http2.constants.HTTP_STATUS_NOT_IMPLEMENTED);

          throw notImplementedThrowable;
        } else {
          ctx.status = http2.constants.HTTP_STATUS_NOT_IMPLEMENTED;
          ctx.set('Allow', allowedArr.join(', '));
        }
      } else if (allowedArr.length) {
        if (ctx.method === 'OPTIONS') {
          ctx.status = http2.constants.HTTP_STATUS_OK;
          ctx.body = '';
          ctx.set('Allow', allowedArr.join(', '));
        } else if (!allowed[ctx.method]) {
          if (options.throw) {
            let notAllowedThrowable = typeof options.methodNotAllowed === 'function'
              ? options.methodNotAllowed()
              : new HttpError(http2.constants.HTTP_STATUS_METHOD_NOT_ALLOWED);
            throw notAllowedThrowable;
          } else {
            ctx.status = http2.constants.HTTP_STATUS_METHOD_NOT_ALLOWED
            ctx.set('Allow', allowedArr.join(', '));
          }
        }
      }
    }

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
 * Create and register a route.
 *
 * @param {string} path
 * @param {array} methods
 * @param  {function} middleware
 *
 * @returns {Layer}
 * @private
 */

Router.prototype.register = function (path, methods, middleware, opts = {}) {
  if (Array.isArray(path)) {
    for (let i = 0; i < path.length; i++) {
      const curPath = path[i];
      this.register(curPath, methods, middleware, opts);
    }

    return this;
  }

  const route = new Layer(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures,
  });

  if (this.opts.prefix) {
    route.setPrefix(this.opts.prefix);
  }

  // add parameter middleware
  for (let i = 0; i < Object.keys(this.params).length; i++) {
    const param = Object.keys(this.params)[i];
    route.param(param, this.params[param]);
  }

  this.stack.push(route);

  return route;
}

/**
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

  for  (let i = 0; i < layers.length; i++) {
    let layer = layers[i];

    if (layer.match(path)) {
      matched.path.push(layer);

      if (layer.methods.length === 0 || ~layer.methods.indexOf(method)) {
        matched.pathAndMethods.push(layer);
        if (layer.methods.length) matched.route = true;
      }
    }
  }

  return matched;
}

/**
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
 */

Router.url = function (path) {
  const args = Array.prototype.slice.call(arguments, 1);
  return Layer.prototype.url.apply({ path: path }, args);
}

/**
 * *****************************************************************************
 *
 * Route layer
 *
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
 * *****************************************************************************
 */

class Layer {
  constructor (path, methods, middleware, opts = {}) {
    this.opts = Object.assign({}, opts);
    this.name = this.opts.name || null;
    this.methods = [];
    this.paramNames = [];
    this.stack = Array.isArray(middleware) ? middleware : [middleware];

    for (let i = 0; i < methods.length; i++) {
      const len = this.methods.push(methods[i].toUpperCase());
      if (this.methods[len-1] === 'GET') this.methods.unshift('HEAD');
    }

    for (let i = 0; i < this.stack.length; i++) {
      const fn = this.stack[i];
      if (typeof(fn) !== 'function') {
        throw new Error(`${this.opts.name || path}: middleware must be a function.`);
      }
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
      this.path = (this.path !== '/' || this.opts.strict === true)
        ? `${prefix}${this.path}` 
        : prefix;

      this.paramNames = []; // reset this.paramNames
      this.regexp = pathToRegexp(this.path, this.paramNames, this.opts);
    }

    return this;
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
        const c = captures[i];
        params[this.paramNames[i].name] = c ? decodeURIComponent(c) : c;
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

    // ignore capture
    // or return the matched key
    return this.opts.ignoreCaptures 
      ? [] 
      : path.match(this.regexp).slice(1);
  }

  /**
   * Generate URL for route using given `params`.
   *
   *
   * @param {Object} params url parameters
   * @returns {String} url string
   * @private
   *
   */

  url (params, options) {
    let args = params;
    const url = this.path.replace(/\(\.\*\)/g, '');

    if (typeof(params) !== 'object') {
      args = Array.prototype.slice.call(arguments);

      if (typeof args[args.length - 1] === 'object') {
        options = args[args.length -1];
        args = args.slice(0, args.length -1);
      }
    }

    const toPath = compile(url, options);
    let replaced;

    const tokens = parse(url);
    let replace = {};

    if (args instanceof Array) {
      for (let i = 0, j = 0, len = tokens.length; i < len; i++) {
        if (tokens[i].name) replace[tokens[i].name] = args[j++]
      }
    } else if (tokens.some(token => token.name)) {
      replace = params;
    } else {
      options = params;
    }

    replaced = toPath(replace);

    if (options && options.query) {
      replaced = parseUrl(replaced);
      if (typeof options.query === 'string') {
        replaced.search = options.query;
      } else {
        replaced.search = undefined;
        replaced.query = options.query;
      }

      return formatUrl(replaced);
    }

    return replaced;
  }
}
