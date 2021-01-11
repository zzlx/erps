/**
 * *****************************************************************************
 *
 * Kernel of services
 *
 * KOAS(Kernel of application service), A framwork for backend service.
 *
 * *****************************************************************************
 */

import assert from 'assert';
import cp from 'child_process';
import EventEmitter from 'events'; 

import Context from './Context.mjs';
import compose from './compose.mjs';
import { HTTP_STATUS_EMPTY_CODES } from './constants.mjs';

export default class Application extends EventEmitter {
  constructor(opts = {}) {
    super();
    assert(typeof opts === 'object', 'The opts you provided must be an object.');

    this.opts = Object.assign({}, {
      // default options
      env: 'production',
      keys: "endsC5vcmc=",
      protocol: 'http2',
      contentNegotiation: true, // 默认开启
      compressThreshold: 256*1024, // 256kb
      streamThreshold: 1024*1024,  // 文件大于1M时启用stream传输
      silent: false,
      subdomainOffset: 2,
    }, opts);

    // setting properties
    this.env = this.opts.env;
    this.protocol = this.opts.protocol;
    this.proxy = opts.proxy ? 'true' : false;
    this.subdomainOffset = this.opts.subdomainOffset;
    if (opts.keys) this.keys = this.opts.keys;
    this.silent = this.opts.silent;

    // app storage
    this.middlewares = []; // store middlewares
  }

  /**
   *
   */

  callback () {
    const fn = compose(this.middlewares);

    if (!this.listenerCount('error')) this.on('error', this.onerror); // 绑定事件处理器

    return (stream, headers, flags) => {
      const ctx = new Context();
      ctx.stream = stream;
      ctx.headers = headers;
      ctx.flags = flags;
      ctx.app = this;

      return this.handleRequest(ctx, fn);
    }
  }

  /**
   * Handle request
   */

  handleRequest (ctx, fn) {
    fn(ctx).then(() => respond(ctx)).catch(err => {
      console.log(err);
      if (err.code === 'ENOENT') ctx.status = 404;
      else ctx.status = 500;
      if (this.env === 'development') ctx.body = err.stack;
      respond(ctx);
    });
  }

  /**
	 * app-level error handler
   *
   * @param {Error} err
   * @api private
   */

  onerror(err) {
    assert(err instanceof Error, util.format('non-error thrown: %j', err));

    if (404 == err.status || err.expose) return;
    if (this.silent) return;

    const msg = err.stack || err.toString();

    console.error(msg.replace(/^/gm, '  '));
  }

  /**
   * Use the given middleware 'fn'
   *
   * @param {Function} fn
   * @retrun {Application} self
   * @api public
   */

  use (fn) {
    assert(typeof fn === 'function', 'The middleware must be a function!');

    this.middlewares.push(fn);
    return this;
  }

}

/**
 * respond algorithm
 */

export function respond (ctx) {
  if (ctx.respond === false) return ctx.stream.end(); // allow bypassing respond

  if (null == ctx.status) ctx.status = 404; // set 404 status if not set
  if (null == ctx.body) ctx.body = ctx.status + ": " + ctx.message;

  // response headers
  if (ctx.headersSent === false) {
    ctx.stream.respond(ctx.response.headers, {
      endStream: HTTP_STATUS_EMPTY_CODES.includes(ctx.status) ? true : false, 
      waitForTrailers: false, 
    });
  }

  // respond contents
  if ('HEAD' === ctx.method)  return ctx.stream.end();
  if (ctx.writable === false) return ctx.stream.end();
  if (Buffer.isBuffer(ctx.body)) return ctx.stream.end(ctx.body);
  if (typeof ctx.body === 'string') return ctx.stream.end(ctx.body);
  if (typeof ctx.body.pipe === 'function') return ctx.body.pipe(ctx.stream);
  return ctx.stream.end(); // respond with no content
}
