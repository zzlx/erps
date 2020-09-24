/**
 * *****************************************************************************
 *
 * kernel of service application.
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
      env: process.env.NODE_ENV || 'production',
      keys: ['enpseC5vcmc='],
      protocol: 'http2',
      proxy: false,
      silent: false,
      compressThreshold: 128, // unit kb,超出此阈值后启用压缩
      subdomainOffset: 2, // xxxx.xx
    }, opts);

    this.env = this.opts.env;
    this.protocol = this.opts.protocol ? 'http2' : 'http2';
    this.proxy = this.opts.proxy ? 'true' : false;
    this.subdomainOffset = this.opts.subdomainOffset || 2;
    this.keys = this.opts.keys || ['services'];

    this.middlewares = []; // configured middlewares

    if (util.inspect.custom) {
      this[util.inspect.custom] = this.inspect;
    }

  } // end of constructor

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    if (typeof fn !== 'function') {
      throw new TypeError('The middleware you provided must be a function!');
    }

    this.middlewares.push(fn); // 存储到中间件数组

    return this;
  }

  /**
   *
   */

  callback () {
    const fn = this.compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror); // 绑定事件处理器

    return (stream, headers, flags) => {
      const ctx = new Context(); // create context object

      ctx.app = this;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.state = Object.create(null);
      ctx.state.errors = [];
      ctx.stream = stream;

      return fn(ctx)
        .then(() => respond(ctx))
        .catch(err => { ctx.status = 500; ctx.body = err.message });
    }
  }

  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
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

function respond (ctx) {
  if (false === ctx.respond) return; // bypass response

  // 响应空消息
  if (null == ctx.body) {
    ctx.status = ctx.status || 404;
    ctx.body = ctx.message;
  }

  if (!ctx.headersSent) {
    const headers = ctx.response.headers;
    const options = { 
      endStream: [204, 205, 304].includes(ctx.status) ? true : false, 
      waitForTrailers: false 
    };

    ctx.stream.respond(headers, options);
  }

  if (!ctx.writable) return ctx.stream.end();

  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body);
  if (typeof ctx.body === 'string') return ctx.stream.end(ctx.body);

  if (ctx.body instanceof Stream) {
    Stream.pipeline(
      ctx.body, 
      ctx.stream, 
      err => { if (err) console.log(err); }
    );
  }
}
