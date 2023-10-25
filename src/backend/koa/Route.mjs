/**
 * *****************************************************************************
 * 
 * Route Layer 
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
 * *****************************************************************************
 */

import assert from 'node:assert';
import path from 'node:path';
import util from 'node:util';
import { sha1, regularPath } from '../utils/index.mjs';

const debug = util.debuglog('debug:route');

export class Route {
  constructor (path, methods, middleware, opts = {}) {
    // 配置项
    this.opts = Object.assign({}, {
      name: `route_${sha1(path)}`,
      sensitive: false,
      strict: false,
      ignoreCaptures: null,
    }, opts);

    this.methods = Array.isArray(methods)
      ? methods.map(m => m.toUpperCase()) 
      : typeof methods === 'string' 
        ? methods.split(',').map(m => m.toUpperCase())
        : ['HEAD', 'GET', 'POST'];

    if (this.methods.includes('GET')) {
      if (!this.methods.includes('HEAD')) this.methods.unshift('HEAD');
    }

    this.name = this.opts.name;
    this.path = path;
    this.paramNames = [];
    this.regexp = regularPath.pathToRegexp(path, this.paramNames, this.opts);
    this.stack = Array.isArray(middleware) ? middleware : [ middleware ];

    for (const fn of this.stack) {
      assert(typeof fn === 'function', `${fn} must be a function.`);
    }
  }

  /**
   * Prefix route path.
   *
   * @param {String} prefix
   * @returns {Route}
   * @private
   */

  setPrefix (prefix) {
    if (this.path) {
      this.path = this.path !== '/' || this.opts.strict === true
        ? path.join(prefix, this.path) 
        : prefix;

      // update this.regexp and reset this.paramNames
      this.paramNames = []; 
      this.regexp = regularPath.pathToRegexp(this.path, this.paramNames, this.opts);
    }

    return this;
  }
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

Route.prototype.params = function (path = '', captures = [], existingParams) {
  const params = Object.assign({}, existingParams);

  for (let i = 0; i < captures.length; i++) {
    if (this.paramNames[i]) {
      const c = captures[i];
      params[this.paramNames[i].name] = c ? decodeURIComponent(c) : c;
    }
  }

  return params;
}

/**
 * Run validations on route named parameters
 *
 * @param {string} param
 * @param {function} middleware
 * @returns {Route}
 * @private
 */

Route.prototype.param = function (param, fn) {
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
        stack.splice(i, 0, middleware); // 插入
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

Route.prototype.match = function (path) {
  return this.regexp.test(path);
}

/**
 * Returns array of regexp url path captures.
 *
 * @param {String} path
 * @returns {Array.<String>}
 * @private
 */

Route.prototype.captures = function (path) {
  if (this.opts.ignoreCaptures) return [];

  const c = path.match(this.regexp);

  if (c !== null && Array.isArray(c)) {
    return c.slice(1);
  } else {
    return [];
  }
}

/**
 * Generate URL for route using given `params`.
 *
 * ```javascript
 * const route = new Route('/users/:id', ['GET'], fn);
 * route.url({ id: 123 }); // => "/users/123"
 * ```
 * @param {Object} params url parameters
 * @returns {String} url string
 * @private
 */

Route.prototype.url = function url (params, options) {
  let args = params;
  const url = this.path.replace(/\(\.\*\)/g, '');

  if (typeof params !== 'object') {
    args = Array.prototype.slice.call(arguments);

    if (typeof args[args.length - 1] === 'object') {
      options = args[args.length -1];
      args = args.slice(0, -1);
    }
  }

  const toPath = regularPath.compile(url, Object.assign({}, options));
  let replaced;

  const tokens = regularPath.parse(url);
  let replace = {};

  if (Array.isArray(args)) {
    let j = 0;
    for (const token of tokens) {
      if (token.name) replace[token.name] = args[j++];
    }
  } else if (tokens.some(token => token.name)) {
    replace = params;
  } else {
    options = params;
  }

  replaced = toPath(replace);

  if (options && options.query) {
    replaced = new URL(replaced);
    replaced.search = typeof options.query === 'string' ? options.query : undefined;
    return replaced.href;
  }

  return replaced;
}
