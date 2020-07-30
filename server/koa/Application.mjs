/**
 * *****************************************************************************
 *
 * kernel of application.
 *
 * Usage:
 *
 * const app = new Application();
 *
 * *****************************************************************************
 */

// node modules
import EventEmitter from 'events'; 
import cp from 'child_process';
import path from 'path';
import Stream from 'stream';
import util from 'util';

// modules
import Router from './Router.mjs';
import Context from './Context.mjs';

const __filename = import.meta.url.substr(7);
const __basename = path.basename(__filename);
const debug = util.debuglog(`debug:${__basename}`); // debug function
const REQ_HEADERS = Symbol.for('context#request-headers');

export default class Application extends EventEmitter {
  constructor(opts) {
    super();

    this.opts = Object.assign({}, { 
      // default options
      env: 'production',
      keys: ['org.zzlx'],
      protocol: 'http2',
      proxy: false,
      silent: false,
      compressThreshold: 128, // unit kb,超出此阈值后启用压缩
      subdomainOffset: 2, // xxxx.xx
    }, opts);

    this.env = this.opts.env || 'production';
    this.protocol = this.opts.protocol ? 'http2' : 'http2';
    this.proxy = this.opts.proxy ? 'true' : false;
    this.subdomainOffset = this.opts.subdomainOffset || 2;
    this.keys = this.opts.keys || ['services'];

    this.middlewares = []; // configured middlewares

    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }

  }

  /**
   * inspect
   */

  inspect () {
    return this.toJSON();
  }

  /**
   *
   *
   */

  toJSON () {
    return {
      'env': this.env,
      'subdomainOffset': this.subdomainOffset,
      'proxy': this.proxy,
      'keys': this.keys,
    };
  }

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    if (typeof fn !== 'function') throw new TypeError('Middleware must a function!');

		debug('use %s', fn._name || fn.name || "unnamed function");

    this.middlewares.push(fn);

    return this;
  }

  /**
   *
   */

  callback () {
    const fn = this.compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror);

    return (stream, headers, flags) => {
      const ctx = new Context(); // create context object

      ctx.app = this;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.state = new Map(); // store states
      ctx.stream = stream;

      return this.handleRequest(ctx, fn);
    }
  }

  /**
   * Return a handler callback for node's http2 server stream event
   * 
   * @return {Function}
   * @api public
   */

  handleRequest (ctx, fn) {
		return fn(ctx).then(() => this.respond(ctx)).catch(err => {
      debug(err);
      ctx.status = 500;
      if (this.env != 'production') ctx.body = err.message;
      this.respond(ctx);
    });
  }

  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err, ctx) {
    if (!(err instanceof Error)) {
      throw new TypeError(util.format('non-error thrown: %j', err));
    }

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();
    debug(msg.replace(/^/gm, '  '));
  }

  /**
   * Compose `middleware` returning a fully valid middleware.
   *
   * @param {Array} middleware
   * @return {Function}
   */

  compose(middleware) {
    if (!Array.isArray(middleware)) {
      throw new TypeError('Middleware must be an array!');
    }

    return function middlewareFn (context, next) {
      let index = -1;
      return dispatch(0);

      function dispatch (i) {
        if (i <= index) {
          return Promise.reject(new Error('next() called multiple times'));
        }

        index = i;
        let fn = (i === middleware.length) ? next : middleware[i];
        if (!fn) return Promise.resolve();

        try {
          // 给中间件绑定this对象
          return Promise.resolve(fn.call(context, context, dispatch.bind(null, ++i)));
        } catch (err) {
          return Promise.reject(err);
        }
      }
    }
  }
}

// 附加路由
Application.Router = Router;

/**
 * Response stream
 *
 */

Application.prototype.respond = function (ctx) {
  if (false === ctx.respond) return; 

  let body = ctx.body;

  if (null == body) {
    ctx.status = ctx.status || 404;
    body = ctx.message;
  }

  if (!ctx.headerSent) {
	  ctx.stream.respond(ctx.response.headers);
  }

  if (!ctx.writable) {
		debug('Can not write to stream, ctx.writable is false.');
		return this.stream.end();
	}

  // buffer body
  if (Buffer.isBuffer(body) || typeof body === 'string') {
    return ctx.stream.end(body);
  }

	// stream body
  if (body instanceof Stream) return body.pipe(ctx.stream);
}
