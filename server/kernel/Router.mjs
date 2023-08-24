/**
 * *****************************************************************************
 * 
 * 服务端路由组件
 * =============
 * 
 * # Example:
 *
 * ```javascript
 * const app = new Koa();
 *
 * const router = new Router();
 * router.get("/", (ctx, next) => {});
 *
 * app.use(router.routes());
 *
 * ```
 *
 * # API Reference
 *
 * When a route is matched, its path is available at ctx._matchedRoute
 * and if named, the name is available at ctx._matchedRouteName
 *
 * *****************************************************************************
 */

import assert from "node:assert";
import path from "node:path";
import util from "node:util";
import { Route } from "./Route.mjs";
import { compose } from "./compose.mjs";
import { HTTP_STATUS } from "../constants.mjs";
import { regularPath } from "../utils/index.mjs";

const debug = util.debuglog("debug:server-side-router");

/**
 * Router
 *
 * @param {object} opts
 * @param {string} opts.prefix
 */

export class Router {
  constructor (options = {}) {
    this.opts = Object.assign({
      prefix: null,
      host: null,
    }, options);

    this.methods = Array.isArray(this.opts.methods)
      ? this.opts.methods
      : typeof this.opts.methods === "string"
        ? String.prototype.split.call(this.opts.methods, ",")
        : [ "HEAD", "GET", "OPTIONS", "POST" ];
    this.exclusive = Boolean(this.opts.exclusive); // 匹配唯一的路由
    this.params = {}; // parameters
    this.stack  = []; // route stacks
    this.addMethods(); // add router methods, e.g. router.get/router.post
  }
}

/**
 * Generate URL from url pattern with given `params`.
 *
 * API Reference: Router.url(path, params) ⇒ String
 *
 * # example
 *
 * ```javascript
 * const url = Router.url("/users/:id", {id: 1}); // => "/users/1"
 * ```
 *
 * @param {String} path url pattern
 * @param {Object} params url parameters
 * @returns {String}
 *
 */

Router.url = function (path) {
  const args = Array.prototype.slice.call(arguments, 1);
  return Route.prototype.url.apply({ path: path }, args);
};

/**
 * Generate URL for route. 
 *
 * Takes a route name and map of named params
 *
 * API Reference: this.url(name, params, [options]) ⇒ String | Error
 *
 *
 * ```javascript
 * router.get("user", "/users/:id", (ctx, next) => { });
 * router.url("user", 3); // => "/users/3"
 * ```
 *
 * @param {string} name route name
 * @param {object} params url parameters
 * @param {object} [options]
 * @param {object|string} [options.query] query options
 * @returns {string|error}
 */

Router.prototype.url = function (name) {
  const route = this.route(name);
  if (route) return route.url(Array.prototype.slice.call(arguments, 1));
  return new Error(`No route found for name: ${name}`);
};

/**
 * Register route with all methods
 *
 * @param {string} name optional
 * @param {string} path
 * @param {function} middleware support multiple middlewares
 * @param {function} callback
 * @returns {Router}
 */

Router.prototype.all = function (name, path) {
  let middlewares;

  if (typeof path === "string" || path instanceof RegExp || Array.isArray(path)) {
    middlewares = Array.prototype.slice.call(arguments, 2);
  } else {
    middlewares = Array.prototype.slice.call(arguments, 1);
    path = name;
    name = null;
  }

  if (middlewares.length) { 
    this.register(path, this.methods, middlewares, { name: name });
  }

  return this;
};

/**
 * Run middleware for named route parameters.  useful for auto-loading or validation
 *
 * API Reference: this.param(param, middleware) ⇒ Router
 *
 * @example
 *
 * ```javascript
 * router
 *   .param("user", function (id, ctx, next) {
 *     ctx.user = users[id];
 *     if (!ctx.user) return ctx.status = 404;
 *     next();
 *   })
 *   .get("/users/:user", function (ctx, next) {
 *     ctx.body = ctx.user;
 *   });
 * ```
 *
 *
 * @param {string} param
 * @param {function} middleware
 * @returns {Router}
 */

Router.prototype.param = function (param, middleware) {
  this.params[param] = middleware;
  for (const route of this.stack) route.param(param, middleware);
  return this;
};

/**
 * Lookup route with given name.
 *
 * Usage: router.route(routeName) => namedRoute
 *
 * @param {string} name
 * @returns {Route|false}
 */

Router.prototype.route = function (routeName) {
  let namedRoute = null;

  for (const route of this.stack) {
    // 此算法仅返回第一个匹配的路由
    // ? 无法保证存在同名的路由，如果有多个同名的路由，仅能返回第一个匹配的路由
    if (route.name && route.name === routeName) {
      namedRoute = route;
      break;
    }
  }

  return namedRoute;
};

/**
 * Set the path prefix for a Router instance that was already initialized.
 * prefix always should start from / otherwise it won"t work.
 *
 * router.prefix(prefix) ⇒ Router
 *
 * Example:
 *
 *  ```javascript
 * router.prefix("/things")
 * router.get("/", ...); // respond to "/things"
 * ```
 *
 * @param {String} prefix
 * @returns {Router}
 */

Router.prototype.prefix = function (prefix = "") {
  this.opts.prefix = prefix.replace(/\/$/, "");

  /* 
  this.opts.prefix = prefix.charAt(prefix.length - 1) === "/" 
    ? prefix.slice(0, -1) 
    : prefix;
  */

  for (const route of this.stack) route.setPrefix(this.opts.prefix); // 
  return this;
};

/**
 * use middleware
 *
 * .use([path], middleware) ⇒ Router
 *
 * @param {String} path
 * @param {Function} middleware
 * @returns {Router}
 */

Router.prototype.use = function use () {

  const router = this;

  const middleware = Array.prototype.slice.call(arguments);
  let pathname;

  // support array of paths 
  if (Array.isArray(middleware[0]) && typeof middleware[0][0] === "string") {
    const paths = middleware[0];
    const middlewares = middleware.slice(1);
    for (const p of paths) router.use.apply(router, [p].concat(middlewares));
    return this;
  }

  const hasPath = typeof middleware[0] === "string";
  if (hasPath) pathname = middleware.shift(); // 目录配置

  for (const m of middleware) {
    if (m.router) {

      const cloneRouter = new Router(m.router.opts);
      cloneRouter.stack = m.router.stack;
      cloneRouter.params = m.router.params;

      for (let i = 0; i < cloneRouter.stack.length; i++) {
        const nestedRoute = cloneRouter.stack[i];

        const cloneRoute = new Route(
          nestedRoute.path, 
          nestedRoute.methods, 
          nestedRoute.stack,
          nestedRoute.opts,
        );



        if (pathname) cloneRoute.setPrefix(pathname);

        if (this.opts.prefix || m.router.opts.prefix) {
          // if this.opts.prefix and m.router.opts.prefix is both null, prefix will be "."
          const prefix = path.join(this.opts.prefix || "", m.router.opts.prefix || "");
          cloneRoute.setPrefix(prefix);
        }

        this.stack.push(cloneRoute);
        cloneRouter.stack[i] = cloneRoute;
      }

      for (const k of Object.keys(this.params)) {
        cloneRouter.param(k, this.params[k]);
      }

    
    } else { 
      const keys = [];
      regularPath.pathToRegexp(this.opts.prefix || "", keys);
      const routerPrefixHasParam = this.opts.prefix && keys.length;
      router.register(pathname || "([^/]*)", this.methods, m, {
        end: false, 
        ignoreCaptures: !hasPath && !routerPrefixHasParam,
      });
    }

  }

  return this;
};

/**
 *
 *
 */

Router.prototype.matchHost = function (host) {
  if (!this.opts.host) return true;
  if (!host) return false;
  if (typeof this.opts.host === "string") return this.opts.host === host;
  if (typeof this.opts.host === "object") return this.opts.host.test(host);
};

/**
 * Return router middleware that dispatch a route matching
 *
 * When a route is matched, its path is available at ctx._matchedRoute 
 * and if named, the name is available at ctx._matchedRouteName
 *
 * @returns {function}
 */

Router.prototype.routes = function routes () {
  const router = this;

  const dispatch = function dispatch (ctx, next) {
    // setting ctx.router
    ctx.router = router;

    // matching host 
    if (!router.matchHost(ctx.host)) {
      debug(`host ${ctx.host} is not matched.`);
      return next();
    }

    const path = router.opts.routerPath || ctx.newRouterPath || ctx.pathname || ctx.routerPath;
    const matched = router.match(path, ctx.method); // match path and method


    // setting ctx.matched
    if (ctx.matched) ctx.matched.push(matched.path);
    else ctx.matched = matched.path;

    if (!matched.route) return next(); 

    const matchedRoutes     = matched.pathAndMethod; // matched routes
    const mostSpecificRoute = matchedRoutes[matchedRoutes.length - 1]; // most specific route
    ctx._matchedRoute = mostSpecificRoute.path;
    if (mostSpecificRoute.name) ctx._matchedRouteName = mostSpecificRoute.name;

    const routes = router.exclusive ? [ mostSpecificRoute ] : matchedRoutes;
    const routeChain = routes.reduce((memo, route) => {
      // 路由
      memo.push(function applyRoute2Context (ctx, next) {
        ctx.captures   = route.captures(path, ctx.captures);

        ctx.params     = route.params(path, ctx.captures, ctx.params);
        ctx.routerName = route.name;
        return next();
      });

      return memo.concat(route.stack); // 路由的中间件
    }, []);

    return compose(routeChain)(ctx, next);
  };

  dispatch.router = this;

  return dispatch;
};

/**
 * Redirect source to destination URL with optional 3xx status code.
 *
 * @param {string} source URL or route name.
 * @param {string} destination URL or route name.
 * @param {number} code Http status code(default: 301 moved permanently)
 * @return {Router}
 */

Router.prototype.redirect = function (source, destination, code) {
  // lookup source route by name
  if (source[0] !== "/") { source = this.url(source); }
  // lookup destination route by name
  if (destination[0] !== "/") { destination = this.url(destination); }

  return this.all(source, (ctx, next) => {
    ctx.redirect(destination);
    ctx.status = code ? code : HTTP_STATUS.MOVED_PERMANENTLY;
    return next();
  });
};

/**
 * Create and register a route
 *
 * @param {String} path
 * @param {Array.<String>} methods of HTTP verbs
 * @param  {Function} middleware
 * @returns {Router} this
 * @private
 */

Router.prototype.register = function (path, methods, middleware, opts = {}) {

  if (Array.isArray(path)) {
    for (const p of path) this.register(p, methods, middleware, opts);
    return this;
  }

  const route = new Route(path, methods, middleware, {
    end: opts.end === false ? opts.end : true,
    name: opts.name,
    sensitive: opts.sensitive || this.opts.sensitive || false,
    strict: opts.strict || this.opts.strict || false,
    prefix: opts.prefix || this.opts.prefix || "",
    ignoreCaptures: opts.ignoreCaptures, // ignore capture
  });

  if (this.opts.prefix) route.setPrefix(this.opts.prefix);
  for (const k of Object.keys(this.params)) route.param(k, this.params[k]);

  this.stack.push(route);

  return this;
};

/**
 * Match the given path and method, return corresponding routes
 *
 * @param {string} path
 * @param {string} method
 * @returns {Object.<path, pathAndMethod> returns routes that matched path and method
 * @private
 */

Router.prototype.match = function (path, method) {
  assert(typeof path === "string", "path must be string");
  assert(typeof method === "string", "method must be string");

  const matched = {
    path: [], // match path
    pathAndMethod: [], // match path and method
    route: false,
  };

  for (const route of this.stack) {
    if (route.match(path)) {
      matched.path.push(route);

      // match the method
      if (route.methods.length === 0 || ~route.methods.indexOf(method)) {
        matched.pathAndMethod.push(route);
        if (route.methods.length) matched.route = true;
      }
    }
  }

  return matched;
};

/**
 * Register router methods 
 *
 * @return {object} Router this.get|put|post|head|options ⇒ Router
 * @private
 */

Router.prototype.addMethods = function () {
  const router = this;

  for (const method of this.methods) {
    router[method.toLowerCase()] = function (name, path, middleware) {

      if (typeof path === "string" || path instanceof RegExp || Array.isArray(path)) {
        middleware = Array.prototype.slice.call(arguments, 2);
      } else {
        middleware = Array.prototype.slice.call(arguments, 1);
        path = name;
        name = null;
      }

      router.register(path, [ method ], middleware, { name: name });

      return router;
    };
  } // 🔚End for lpat}
};
