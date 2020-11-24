/**
 * *****************************************************************************
 * 
 * Route
 *
 * *****************************************************************************
 */

import { assert, compile, parse, path, pathToRegexp } from '../utils.lib.mjs';

export default class Layer {
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
      if (typeof fn !== 'function') {
        throw new Error(`${fn} must be a function.`);
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
